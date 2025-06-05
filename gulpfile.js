/* ----------------------------------------------------------------------------
 * @webSchedulr - Online Appointment Scheduler
 *
 * @package     @webSchedulr
 * @author      N. Cara <nilo.cara@frontend.co.za>
 * @copyright   Copyright (c) Nilo Cara
 * @license     https://opensource.org/licenses/GPL-3.0 - GPLv3
 * @link        https://webschedulr.co.za
 * @since v1.5.1  // ← This will auto-update
 * ---------------------------------------------------------------------------- */

const babel = require('gulp-babel');
const changed = require('gulp-changed');
const cached = require('gulp-cached');
const remember = require('gulp-remember');
const childProcess = require('child_process');
const css = require('gulp-clean-css');
const del = require('del');
const fs = require('fs-extra');
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const zip = require('zip-dir');
const glob = require('glob');

// Performance tracking
function timeTask(taskName) {
    const start = Date.now();
    return () => {
        const duration = Date.now() - start;
        console.log(`⏱️  ${taskName} completed in ${duration}ms`);
    };
}

function clean(done) {
    console.log('🧹 Cleaning generated assets...');
    const timer = timeTask('Clean');
    
    del.sync([
        'assets/css/**/*.css',
        'assets/css/**/*.min.css',
        '!assets/css/**/*.scss'
    ]);
    
    timer();
    done();
}

function cleanRoot(done) {
    console.log('🧹 Cleaning root directory...');
    const timer = timeTask('Clean Root');
    
    // Remove existing build directory
    if (fs.existsSync('build')) {
        fs.removeSync('build');
    }
    
    // Remove build.zip
    if (fs.existsSync('build.zip')) {
        fs.removeSync('build.zip');
        console.log(`🗑️  Removed: build.zip`);
    }
    
    // Remove any existing zip files with the pattern
    const zipFiles = glob.sync('@webSchedulr*.zip');
    zipFiles.forEach(file => {
        fs.removeSync(file);
        console.log(`🗑️  Removed: ${file}`);
    });
    
    timer();
    done();
}

// Optimized scripts with better caching and error handling
function scripts() {
    console.log('📜 Processing JavaScript files...');
    const timer = timeTask('Scripts');
    
    return gulp
        .src(['assets/js/**/*.js', '!assets/js/**/*.min.js'])
        .pipe(plumber({
            errorHandler: function(err) {
                console.error('❌ JavaScript error:', err.message);
                this.emit('end');
            }
        }))
        .pipe(cached('scripts'))
        .pipe(remember('scripts'))
        .pipe(changed('assets/js', { extension: '.min.js' }))
        .pipe(babel({
            comments: false,
            presets: [
                ['minify', {
                    builtIns: false,
                    mangle: false,
                    deadcode: true,
                    removeConsole: false, // Keep console for debugging
                    removeDebugger: true
                }]
            ]
        }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('assets/js'))
        .on('end', timer);
}

// Optimized styles with better caching
function styles() {
    console.log('🎨 Processing SCSS files...');
    const timer = timeTask('Styles');
    
    return gulp
        .src(['assets/css/**/*.scss'])
        .pipe(plumber({
            errorHandler: function(err) {
                console.error('❌ SCSS error:', err.message);
                this.emit('end');
            }
        }))
        .pipe(cached('styles'))
        .pipe(remember('styles'))
        .pipe(changed('assets/css', { extension: '.min.css' }))
        .pipe(sass({
            outputStyle: 'compressed',
            includePaths: ['node_modules']
        }))
        .pipe(css({
            level: 2,
            compatibility: 'ie9',
            rebase: false
        }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('assets/css'))
        .on('end', timer);
}

// Parallel vendor processing
function vendor() {
    console.log('📦 Processing vendor files...');
    const timer = timeTask('Vendor');
    
    // Clear vendor directory
    del.sync(['assets/vendor/**', '!assets/vendor/index.html']);

    // Create vendor tasks array for parallel execution
    const vendorTasks = [
        // Bootstrap
        () => gulp.src([
            'node_modules/bootstrap/dist/js/bootstrap.min.js',
            'node_modules/bootstrap/dist/css/bootstrap.min.css',
        ]).pipe(gulp.dest('assets/vendor/bootstrap')),

        // FontAwesome
        () => gulp.src([
            'node_modules/@fortawesome/fontawesome-free/js/fontawesome.min.js',
            'node_modules/@fortawesome/fontawesome-free/js/solid.min.js',
        ]).pipe(gulp.dest('assets/vendor/@fortawesome-fontawesome-free')),

        // Cookie Consent
        () => gulp.src([
            'node_modules/cookieconsent/build/cookieconsent.min.js',
            'node_modules/cookieconsent/build/cookieconsent.min.css',
        ]).pipe(gulp.dest('assets/vendor/cookieconsent')),

        // FullCalendar
        () => gulp.src(['node_modules/fullcalendar/index.global.min.js'])
            .pipe(gulp.dest('assets/vendor/fullcalendar')),

        // FullCalendar Moment
        () => gulp.src(['node_modules/@fullcalendar/moment/index.global.min.js'])
            .pipe(gulp.dest('assets/vendor/fullcalendar-moment')),

        // jQuery
        () => gulp.src(['node_modules/jquery/dist/jquery.min.js'])
            .pipe(gulp.dest('assets/vendor/jquery')),

        // jQuery Jeditable
        () => gulp.src(['node_modules/jquery-jeditable/dist/jquery.jeditable.min.js'])
            .pipe(gulp.dest('assets/vendor/jquery-jeditable')),

        // Moment
        () => gulp.src(['node_modules/moment/min/moment.min.js'])
            .pipe(gulp.dest('assets/vendor/moment')),

        // Moment Timezone
        () => gulp.src(['node_modules/moment-timezone/builds/moment-timezone-with-data.min.js'])
            .pipe(gulp.dest('assets/vendor/moment-timezone')),

        // Popper
        () => gulp.src(['node_modules/@popperjs/core/dist/umd/popper.min.js'])
            .pipe(gulp.dest('assets/vendor/@popperjs-core')),

        // Select2
        () => gulp.src([
            'node_modules/select2/dist/js/select2.min.js',
            'node_modules/select2/dist/css/select2.min.css'
        ]).pipe(gulp.dest('assets/vendor/select2')),

        // Tippy.js
        () => gulp.src(['node_modules/tippy.js/dist/tippy-bundle.umd.min.js'])
            .pipe(gulp.dest('assets/vendor/tippy.js')),

        // Trumbowyg
        () => gulp.src([
            'node_modules/trumbowyg/dist/trumbowyg.min.js',
            'node_modules/trumbowyg/dist/ui/trumbowyg.min.css'
        ]).pipe(gulp.dest('assets/vendor/trumbowyg')),

        // Trumbowyg Icons
        () => gulp.src(['node_modules/trumbowyg/dist/ui/icons.svg'])
            .pipe(gulp.dest('assets/vendor/trumbowyg/ui')),

        // Flatpickr
        () => gulp.src([
            'node_modules/flatpickr/dist/flatpickr.min.js',
            'node_modules/flatpickr/dist/flatpickr.min.css'
        ]).pipe(gulp.dest('assets/vendor/flatpickr')),

        // Flatpickr Theme
        () => gulp.src(['node_modules/flatpickr/dist/themes/material_green.css'])
            .pipe(css())
            .pipe(rename({ suffix: '.min' }))
            .pipe(gulp.dest('assets/vendor/flatpickr'))
    ];

    // Execute all vendor tasks in parallel
    return Promise.all(vendorTasks.map(task => task()))
        .then(() => {
            timer();
            console.log('✅ Vendor files processed');
        });
}

// Optimized cache token update
function updateCacheToken(done) {
    console.log('🔄 Updating cache token...');
    const timer = timeTask('Cache Token Update');
    
    const configPath = 'application/config/app.php';
    const timestamp = Math.floor(Date.now() / 1000);
    const version = new Date().toISOString().slice(2,7).replace('-','');
    const newToken = `WS${version}_v${timestamp.toString().slice(-6)}`;
    
    if (!fs.existsSync(configPath)) {
        console.error('❌ Config file not found:', configPath);
        done();
        return;
    }
    
    try {
        let content = fs.readFileSync(configPath, 'utf8');
        
        content = content.replace(
            /\$config\['cache_busting_token'\]\s*=\s*'[^']*';\s*\/\/.*$/m,
            `$config['cache_busting_token'] = '${newToken}'; // Auto-generated during build`
        );
        
        fs.writeFileSync(configPath, content);
        console.log(`✅ Cache token updated to: ${newToken}`);
        timer();
        done();
    } catch (error) {
        console.error('❌ Failed to update cache token:', error.message);
        done(error);
    }
}

function createBuildStructure(done) {
    console.log('📁 Creating build structure...');
    const timer = timeTask('Build Structure');
    
    try {
        fs.ensureDirSync('build');
        
        // Copy main directories in parallel
        const copyTasks = [
            () => fs.copySync('application', 'build/application'),
            () => fs.copySync('system', 'build/system'),
            () => fs.copySync('assets', 'build/assets', {
                filter: (src) => {
                    // Exclude source files for production
                    if (src.endsWith('.scss')) return false;
                    if (src.endsWith('.css') && !src.endsWith('.min.css')) return false;
                    return true;
                }
            })
        ];
        
        // Execute copy tasks in parallel
        Promise.all(copyTasks.map(task => task()));
        
        // Create storage structure
        const storageDirs = ['backups', 'cache', 'logs', 'sessions', 'uploads'];
        storageDirs.forEach(dir => {
            const buildStorageDir = `build/storage/${dir}`;
            fs.ensureDirSync(buildStorageDir);
            
            if (fs.existsSync(`storage/${dir}/.htaccess`)) {
                fs.copySync(`storage/${dir}/.htaccess`, `${buildStorageDir}/.htaccess`);
            }
            if (fs.existsSync(`storage/${dir}/index.html`)) {
                fs.copySync(`storage/${dir}/index.html`, `${buildStorageDir}/index.html`);
            }
        });
        
        // Copy root files
        const rootFiles = [
            'index.php', 'patch.php', 'composer.json', 'composer.lock', 
            'config-sample.php', 'CHANGELOG.md', 'README.md', 'LICENSE'
        ];
        
        rootFiles.forEach(file => {
            if (fs.existsSync(file)) {
                fs.copySync(file, `build/${file}`);
            }
        });
        
        console.log('✅ Build structure created');
        timer();
        done();
    } catch (error) {
        console.error('❌ Error creating build structure:', error.message);
        done(error);
    }
}

function installComposer(done) {
    console.log('📦 Installing PHP dependencies...');
    const timer = timeTask('Composer Install');
    
    try {
        childProcess.execSync('cd build && composer install --no-interaction --no-dev --optimize-autoloader', {
            stdio: 'inherit'
        });
        console.log('✅ Composer dependencies installed');
        timer();
        done();
    } catch (error) {
        console.error('❌ Composer install failed:', error.message);
        done(error);
    }
}

function optimizeGoogleServices(done) {
    console.log('⚡ Optimizing Google services...');
    const timer = timeTask('Google Services Optimization');
    
    const keepServices = ['Calendar', 'Analytics'];
    const servicesPath = 'build/vendor/google/apiclient-services/src/';
    
    if (!fs.existsSync(servicesPath)) {
        console.log('ℹ️  Google services directory not found, skipping optimization');
        timer();
        done();
        return;
    }
    
    const services = fs.readdirSync(servicesPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
    
    let removed = 0;
    services.forEach(service => {
        if (!keepServices.includes(service)) {
            fs.removeSync(`${servicesPath}${service}`);
            removed++;
        }
    });
    
    console.log(`🗑️  Removed ${removed} unused Google services`);
    timer();
    done();
}

function finalCleanup(done) {
    console.log('🧹 Final cleanup...');
    const timer = timeTask('Final Cleanup');
    
    const devFiles = [
        'build/composer.lock',
        'build/.git',
        'build/.gitignore',
        'build/node_modules',
        'build/package.json',
        'build/gulpfile.js'
    ];
    
    devFiles.forEach(file => {
        if (fs.existsSync(file)) {
            fs.removeSync(file);
        }
    });
    
    // Remove .DS_Store files
    try {
        childProcess.execSync('find build -name ".DS_Store" -delete 2>/dev/null || true');
    } catch (error) {
        // Ignore errors on non-Unix systems
    }
    
    timer();
    done();
}

function getCacheToken() {
    const configPath = 'application/config/app.php';
    if (!fs.existsSync(configPath)) {
        return 'unknown';
    }
    
    const content = fs.readFileSync(configPath, 'utf8');
    const match = content.match(/\$config\['cache_busting_token'\]\s*=\s*'([^']*)'/);
    
    if (match && match[1]) {
        const tokenMatch = match[1].match(/v(\d+)/);
        return tokenMatch ? tokenMatch[1] : match[1];
    }
    
    return 'unknown';
}

function createArchive(done) {
    console.log('📦 Creating archives...');
    const timer = timeTask('Archive Creation');
    
    const cacheToken = getCacheToken();
    const versionedFilename = `@webSchedulr_v${cacheToken}.zip`;
    const buildFilename = 'build.zip';
    
    // Remove any existing files
    [versionedFilename, buildFilename].forEach(file => {
        if (fs.existsSync(file)) {
            fs.removeSync(file);
        }
    });
    
    zip('build', { saveTo: versionedFilename }, function (error) {
        if (error) {
            console.error('❌ Archive creation failed:', error);
            done(error);
            return;
        }
        
        console.log(`✅ Versioned archive created: ${versionedFilename}`);
        
        // Create build.zip by copying
        fs.copySync(versionedFilename, buildFilename);
        console.log(`✅ Build archive created: ${buildFilename}`);
        
        const stats = fs.statSync(versionedFilename);
        const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`📊 Archive size: ${fileSizeInMB} MB`);
        
        timer();
        done();
    });
}

function watch(done) {
    console.log('👀 Starting file watcher...');
    
    // Clear caches on watch start
    delete cached.caches.scripts;
    delete cached.caches.styles;
    
    gulp.watch(['assets/js/**/*.js', '!assets/js/**/*.min.js'], scripts);
    gulp.watch(['assets/css/**/*.scss'], styles);
    gulp.watch('package.json', vendor);
    
    console.log('✅ Watching for file changes...');
    done();
}

// Add these functions first (if not already present)
function getAppVersion() {
    const configPath = 'application/config/app.php';
    if (!fs.existsSync(configPath)) {
        return '1.0.0';
    }
    
    const content = fs.readFileSync(configPath, 'utf8');
    const match = content.match(/\$config\['version'\]\s*=\s*'([^']*)'/);
    
    return match && match[1] ? match[1] : '1.0.0';
}

function updateVersionReferences(done) {
    console.log('🔄 Updating version references...');
    const timer = timeTask('Version Update');
    
    const currentVersion = getAppVersion();
    console.log(`📋 Current version: ${currentVersion}`);
    
    // Files to update with version references
    const filesToUpdate = [
        'gulpfile.js',
        'README.md',
        'package.json',
        'CHANGELOG.md'
    ];
    
    // Patterns to match and replace
    const patterns = [
        {
            // @since v1.5.1 -> @since v1.5.1
            pattern: /@since\s+v[\d.]+/g,
            replacement: `@since v${currentVersion}`
        },
        {
            // * @since v1.5.1 -> * @since v1.5.1
            pattern: /(\*\s+@since\s+)v[\d.]+/g,
            replacement: `$1v${currentVersion}`
        }
    ];
    
    let updatedFiles = 0;
    
    filesToUpdate.forEach(filePath => {
        if (!fs.existsSync(filePath)) {
            return;
        }
        
        let content = fs.readFileSync(filePath, 'utf8');
        let hasChanges = false;
        
        patterns.forEach(({ pattern, replacement }) => {
            if (pattern.test(content)) {
                content = content.replace(pattern, replacement);
                hasChanges = true;
            }
        });
        
        if (hasChanges) {
            fs.writeFileSync(filePath, content);
            console.log(`✅ Updated version references in: ${filePath}`);
            updatedFiles++;
        }
    });
    
    // Update package.json version field
    updatePackageJsonVersion(currentVersion);
    
    console.log(`📊 Updated ${updatedFiles} files with version ${currentVersion}`);
    timer();
    done();
}

function updatePackageJsonVersion(version) {
    const packagePath = 'package.json';
    if (!fs.existsSync(packagePath)) {
        return;
    }
    
    try {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        if (packageJson.version !== version) {
            packageJson.version = version;
            fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
            console.log(`✅ Updated package.json version to: ${version}`);
        }
    } catch (error) {
        console.error('❌ Failed to update package.json:', error.message);
    }
}

function build(done) {
    console.log('🚀 Build process completed successfully!');
    done();
}

// Parallel task groups
const buildAssets = gulp.parallel(vendor, scripts, styles);
const buildOptimizations = gulp.parallel(optimizeGoogleServices, finalCleanup);

// CORRECTED EXPORTS SECTION
exports.clean = clean;
exports.cleanRoot = cleanRoot;
exports.vendor = vendor;
exports.scripts = scripts;
exports.styles = styles;
exports.updateCacheToken = updateCacheToken;
exports.updateVersions = updateVersionReferences;  // ← Add this line
exports.updateVersionReferences = updateVersionReferences;  // ← Alternative name

// Combined tasks
exports.compile = gulp.series(clean, buildAssets);

// Complete optimized build process
exports.build = gulp.series(
    cleanRoot,
    updateVersionReferences,                   // Add version sync
    gulp.parallel(clean, updateCacheToken),
    buildAssets,
    createBuildStructure,
    installComposer,
    buildOptimizations,
    createArchive,
    build
);

exports.dev = gulp.series(clean, buildAssets, watch);
exports.default = exports.dev;
