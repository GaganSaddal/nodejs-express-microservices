#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const prompts = require('prompts');
const ora = require('ora');

const packageJson = require('../package.json');

// ASCII Art Banner
const banner = `
${chalk.cyan('╔═══════════════════════════════════════════════════════════╗')}
${chalk.cyan('║')}  ${chalk.bold.white('🚀 Node.js Express Microservices Boilerplate')}          ${chalk.cyan('║')}
${chalk.cyan('║')}  ${chalk.gray('Production-ready microservices architecture')}           ${chalk.cyan('║')}
${chalk.cyan('╚═══════════════════════════════════════════════════════════╝')}
`;

async function createProject(projectName, options) {
  console.log(banner);
  console.log(chalk.gray(`\nVersion ${packageJson.version}\n`));

  const targetDir = path.resolve(process.cwd(), projectName);

  // Check if directory exists
  if (fs.existsSync(targetDir)) {
    const { overwrite } = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: `Directory ${chalk.cyan(projectName)} already exists. Overwrite?`,
      initial: false,
    });

    if (!overwrite) {
      console.log(chalk.yellow('\n❌ Operation cancelled'));
      process.exit(1);
    }

    await fs.remove(targetDir);
  }

  // Create project directory
  const spinner = ora('Creating project structure...').start()
  
  try {
    await fs.ensureDir(targetDir);

    // Copy all files from npm package
    const sourceDir = path.resolve(__dirname, '..');
    
    spinner.text = `Copying files from ${sourceDir}...`;
    
    // Files and directories to exclude from copying
    const excludes = [
      'node_modules',  // Don't copy root node_modules
      'bin',           // Don't copy CLI itself
      'package.json',  // Don't copy package metadata
      'package-lock.json',
      '.git',
      '.npmignore',
      'NPM_PUBLISH.md' // Internal docs
    ];

    // Check what files exist
    const items = await fs.readdir(sourceDir);
    
    if (items.length === 0) {
      spinner.fail(chalk.red('No files found in package!'));
      console.error(chalk.yellow(`Source directory: ${sourceDir}`));
      process.exit(1);
    }
    
    // Copy all files except excludes
    for (const item of items) {
      if (excludes.includes(item)) continue;
      
      const sourcePath = path.join(sourceDir, item);
      const targetPath = path.join(targetDir, item);
      
      try {
        await fs.copy(sourcePath, targetPath, {
          filter: (src) => {
            // Don't copy node_modules subdirectories
            if (src.includes('/node_modules/') || src.includes('\\node_modules\\')) {
              return false;
            }
            // Don't copy log files
            if (src.match(/\.log$/) || src.includes('/logs/') || src.includes('\\logs\\')) {
              return false;
            }
            return true;
          }
        });
      } catch (err) {
        console.warn(chalk.yellow(`Warning: Could not copy ${item}: ${err.message}`));
      }
    }

    spinner.succeed(chalk.green('✅ Project structure created'));

    // Generate .env files from examples
    spinner.start('Configuring environment files...');
    await setupEnvFiles(targetDir, projectName);
    spinner.succeed(chalk.green('✅ Environment files configured'));

    // Success message
    console.log('\n' + chalk.green.bold('🎉 Project created successfully!\n'));
    
    console.log(chalk.cyan('📁 Project location:'), chalk.white(targetDir));
    console.log('\n' + chalk.bold('Next steps:\n'));
    console.log(chalk.gray('  1.'), `cd ${chalk.cyan(projectName)}`);
    console.log(chalk.gray('  2.'), chalk.cyan('docker-compose up -d --build'));
    console.log(chalk.gray('  3.'), 'Wait 30 seconds for services to start');
    console.log(chalk.gray('  4.'), 'Test: ' + chalk.cyan('curl http://localhost:3000/health'));
    
    console.log('\n' + chalk.bold('📚 Resources:\n'));
    console.log(chalk.gray('  •'), 'Quick Start:', chalk.cyan('cat QUICKSTART.md'));
    console.log(chalk.gray('  •'), 'API Docs:', chalk.cyan('http://localhost:3000/api-docs'));
    console.log(chalk.gray('  •'), 'Postman:', chalk.cyan('Import postman_collection.json'));
    
    console.log('\n' + chalk.bold.green('Happy coding! 🚀\n'));

  } catch (error) {
    spinner.fail(chalk.red('❌ Failed to create project'));
    console.error(chalk.red('\nError:'), error.message);
    process.exit(1);
  }
}

async function copyDirectory(source, target, excludes = []) {
  const items = await fs.readdir(source);

  for (const item of items) {
    if (excludes.includes(item)) continue;

    const sourcePath = path.join(source, item);
    const targetPath = path.join(target, item);
    const stat = await fs.stat(sourcePath);

    if (stat.isDirectory()) {
      await fs.ensureDir(targetPath);
      await copyDirectory(sourcePath, targetPath, excludes);
    } else {
      await fs.copy(sourcePath, targetPath);
    }
  }
}

async function setupEnvFiles(targetDir, projectName) {
  const services = ['auth-service', 'api-gateway', 'user-service', 'notification-service'];

  for (const service of services) {
    const examplePath = path.join(targetDir, service, '.env.example');
    const envPath = path.join(targetDir, service, '.env');

    if (await fs.pathExists(examplePath)) {
      await fs.copy(examplePath, envPath);
    }
  }
}

// CLI Configuration
program
  .version(packageJson.version)
  .name('create-gs-express-ms')
  .description('🚀 Create a production-ready Node.js Express microservices project')
  .argument('[project-name]', 'Name of the project directory')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .action(async (projectName, options) => {
    let finalProjectName = projectName;

    if (!finalProjectName) {
      const response = await prompts({
        type: 'text',
        name: 'projectName',
        message: 'Project name:',
        initial: 'my-microservices-app',
        validate: (value) => {
          if (!value) return 'Project name is required';
          if (!/^[a-z0-9-_]+$/i.test(value)) {
            return 'Project name can only contain letters, numbers, dashes, and underscores';
          }
          return true;
        },
      });

      finalProjectName = response.projectName;
    }

    if (!finalProjectName) {
      console.log(chalk.red('\n❌ Project name is required'));
      process.exit(1);
    }

    await createProject(finalProjectName, options);
  });

program.parse(process.argv);
