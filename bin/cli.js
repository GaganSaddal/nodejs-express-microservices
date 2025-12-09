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
  const spinner = ora('Creating project structure...').start();
  
  try {
    await fs.ensureDir(targetDir);

    // Copy all files from npm package
    const sourceDir = path.resolve(__dirname, '..');
    
    // Simply copy everything, then remove what we don't want
    spinner.text = 'Copying files...';
    
    await fs.copy(sourceDir, targetDir, {
      filter: (src, dest) => {
        const relativePath = path.relative(sourceDir, src);
        
        // Skip these specific items
        if (relativePath === 'node_modules' || 
            relativePath === 'bin' ||
            relativePath === 'package.json' ||
            relativePath === 'package-lock.json' ||
            relativePath === '.git' ||
            relativePath === '.npmignore' ||
            relativePath === 'NPM_PUBLISH.md') {
          return false;
        }
        
        // Skip node_modules in any service
        if (relativePath.includes('node_modules')) {
          return false;
        }
        
        // Skip log directories
        if (relativePath.includes('/logs') || relativePath.includes('\\logs')) {
          return false;
        }
        
        // Skip log files
        if (relativePath.endsWith('.log')) {
          return false;
        }
        
        return true;
      }
    });

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
    console.error(chalk.gray(error.stack));
    process.exit(1);
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
