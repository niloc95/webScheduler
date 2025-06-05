/* ----------------------------------------------------------------------------
 * @webSchedulr - Online Appointment Scheduler
 *
 * @package     @webSchedulr
 * @author      N. Cara <nilo.cara@frontend.co.za>
 * @copyright   Copyright (c) Nilo Cara
 * @license     https://opensource.org/licenses/GPL-3.0 - GPLv3
 * @link        https://webschedulr.co.za
 * @since       v1.4.0
 * ---------------------------------------------------------------------------- */

const babel = require('gulp-babel');
const changed = require('gulp-changed');
const cached = require('gulp-cached');
const childProcess = require('child_process');
const css = require('gulp-clean-css');
const del = require('del');
const fs = require('fs-extra');
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const zip = require('zip-dir');
const glob = require('glob'); // Add this missing require

function clean(done) {
    // Clean all generated CSS files
    del.sync([
        'assets/css/**/*.css',
        'assets/css/**/*.min.css',
        '!assets/css/**/*.scss'  // Keep source files
    ]);
    done();
}

function cleanRoot(done) {
    console.log('🧹 Cleaning root directory...');
    
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
    
    done();
}

function scripts() {
    return gulp
        .src(['assets/js/**/*.js', '!assets/js/**/*.min.js'])
        .pipe(plumber())
        .pipe(changed('assets/js/**/*'))
        .pipe(babel({
            comments: false,
            presets: ['minify'] // Add minification
        }))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('assets/js'));
}

function styles() {
    return gulp
        .src(['assets/css/**/*.scss'])
        .pipe(plumber())
        .pipe(sass({
            outputStyle: 'compressed',
            includePaths: ['node_modules']
        }).on('error', sass.logError))
        .pipe(css({
            level: 2,
            compatibility: 'ie9'
        }))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('assets/css'));
}

function watch(done) {
    gulp.watch(['assets/js/**/*.js', '!assets/js/**/*.min.js'], gulp.parallel(scripts));
    gulp.watch(['assets/css/**/*.scss', '!assets/css/**/*.css'], gulp.parallel(styles));
    done();
}

function vendor(done) {
    del.sync(['assets/vendor/**', '!assets/vendor/index.html']);

    // bootstrap
    gulp.src([
        'node_modules/bootstrap/dist/js/bootstrap.min.js',
        'node_modules/bootstrap/dist/css/bootstrap.min.css',
    ]).pipe(gulp.dest('assets/vendor/bootstrap'));

    // @fortawesome-fontawesome-free
    gulp.src([
        'node_modules/@fortawesome/fontawesome-free/js/fontawesome.min.js',
        'node_modules/@fortawesome/fontawesome-free/js/solid.min.js',
    ]).pipe(gulp.dest('assets/vendor/@fortawesome-fontawesome-free'));

    // cookieconsent
    gulp.src([
        'node_modules/cookieconsent/build/cookieconsent.min.js',
        'node_modules/cookieconsent/build/cookieconsent.min.css',
    ]).pipe(gulp.dest('assets/vendor/cookieconsent'));

    // fullcalendar
    gulp.src(['node_modules/fullcalendar/index.global.min.js']).pipe(gulp.dest('assets/vendor/fullcalendar'));

    // fullcalendar-moment
    gulp.src(['node_modules/@fullcalendar/moment/index.global.min.js']).pipe(
        gulp.dest('assets/vendor/fullcalendar-moment'),
    );

    // jquery
    gulp.src(['node_modules/jquery/dist/jquery.min.js']).pipe(gulp.dest('assets/vendor/jquery'));

    // jquery-jeditable
    gulp.src(['node_modules/jquery-jeditable/dist/jquery.jeditable.min.js']).pipe(
        gulp.dest('assets/vendor/jquery-jeditable'),
    );

    // moment
    gulp.src(['node_modules/moment/min/moment.min.js']).pipe(gulp.dest('assets/vendor/moment'));

    // moment-timezone
    gulp.src(['node_modules/moment-timezone/builds/moment-timezone-with-data.min.js']).pipe(
        gulp.dest('assets/vendor/moment-timezone'),
    );

    // @popperjs-core
    gulp.src(['node_modules/@popperjs/core/dist/umd/popper.min.js']).pipe(gulp.dest('assets/vendor/@popperjs-core'));

    // select2
    gulp.src(['node_modules/select2/dist/js/select2.min.js', 'node_modules/select2/dist/css/select2.min.css']).pipe(
        gulp.dest('assets/vendor/select2'),
    );

    // tippy.js
    gulp.src(['node_modules/tippy.js/dist/tippy-bundle.umd.min.js']).pipe(gulp.dest('assets/vendor/tippy.js'));

    // trumbowyg
    gulp.src(['node_modules/trumbowyg/dist/trumbowyg.min.js', 'node_modules/trumbowyg/dist/ui/trumbowyg.min.css']).pipe(
        gulp.dest('assets/vendor/trumbowyg'),
    );

    gulp.src(['node_modules/trumbowyg/dist/ui/icons.svg']).pipe(gulp.dest('assets/vendor/trumbowyg/ui'));

    // flatpickr
    gulp.src(['node_modules/flatpickr/dist/flatpickr.min.js', 'node_modules/flatpickr/dist/flatpickr.min.css']).pipe(
        gulp.dest('assets/vendor/flatpickr'),
    );

    gulp.src(['node_modules/flatpickr/dist/themes/material_green.css'])
        .pipe(css())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('assets/vendor/flatpickr'));

    done();
}

function updateCacheToken(done) {
    const configPath = 'application/config/app.php';
    const timestamp = Math.floor(Date.now() / 1000);
    const version = new Date().toISOString().slice(2,7).replace('-','');
    const newToken = `WS${version}_v${timestamp.toString().slice(-6)}`;
    
    if (!fs.existsSync(configPath)) {
        console.error('❌ Config file not found:', configPath);
        done();
        return;
    }
    
    let content = fs.readFileSync(configPath, 'utf8');
    
    content = content.replace(
        /\$config\['cache_busting_token'\]\s*=\s*'[^']*';\s*\/\/.*$/m,
        `$config['cache_busting_token'] = '${newToken}'; // Auto-generated during build`
    );
    
    fs.writeFileSync(configPath, content);
    console.log(`🔄 Updated cache token to: ${newToken}`);
    done();
}

function createBuildStructure(done) {
    console.log('📁 Creating build structure...');
    
    fs.ensureDirSync('build');
    
    // Copy main directories
    fs.copySync('application', 'build/application');
    fs.copySync('system', 'build/system');
    
    // Copy assets but exclude source files for production
    fs.copySync('assets', 'build/assets', {
        filter: (src) => {
            // Exclude .scss files and unminified .css files in production
            if (src.endsWith('.scss')) return false;
            if (src.endsWith('.css') && !src.endsWith('.min.css')) return false;
            return true;
        }
    });
    
    // Create storage structure
    const storageDirs = ['backups', 'cache', 'logs', 'sessions', 'uploads'];
    storageDirs.forEach(dir => {
        const buildStorageDir = `build/storage/${dir}`;
        fs.ensureDirSync(buildStorageDir);
        
        // Copy .htaccess and index.html files if they exist
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
    done();
}

function installComposer(done) {
    console.log('📦 Installing PHP dependencies...');
    try {
        childProcess.execSync('cd build && composer install --no-interaction --no-dev --optimize-autoloader', {
            stdio: 'inherit'
        });
        console.log('✅ Composer dependencies installed');
        done();
    } catch (error) {
        console.error('❌ Composer install failed:', error.message);
        done(error);
    }
}

function optimizeGoogleServices(done) {
    console.log('⚡ Optimizing Google services...');
    
    const keepServices = ['Calendar', 'Analytics'];
    const servicesPath = 'build/vendor/google/apiclient-services/src/';
    
    if (!fs.existsSync(servicesPath)) {
        console.log('ℹ️  Google services directory not found, skipping optimization');
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
    done();
}

function finalCleanup(done) {
    console.log('🧹 Final cleanup...');
    
    // Remove dev files from build
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
        // Extract just the version part (e.g., "v128975" from "WS2506_v128975")
        const tokenMatch = match[1].match(/v(\d+)/);
        return tokenMatch ? tokenMatch[1] : match[1];
    }
    
    return 'unknown';
}

function createArchive(done) {
    const cacheToken = getCacheToken();
    const versionedFilename = `@webSchedulr_v${cacheToken}.zip`;
    const buildFilename = 'build.zip';
    
    console.log(`📦 Creating archives...`);
    
    // Remove any existing files
    if (fs.existsSync(versionedFilename)) {
        fs.removeSync(versionedFilename);
    }
    if (fs.existsSync(buildFilename)) {
        fs.removeSync(buildFilename);
    }
    
    // Create the versioned archive first
    zip('build', { saveTo: versionedFilename }, function (error) {
        if (error) {
            console.error('❌ Versioned archive creation failed:', error);
            done(error);
            return;
        }
        
        console.log(`✅ Versioned archive created: ${versionedFilename}`);
        
        // Create build.zip by copying the versioned file
        fs.copySync(versionedFilename, buildFilename);
        console.log(`✅ Build archive created: ${buildFilename}`);
        
        // Get file size for info
        const stats = fs.statSync(versionedFilename);
        const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`📊 Archive size: ${fileSizeInMB} MB`);
        
        done();
    });
}

function build(done) {
    console.log('🚀 Build process completed successfully!');
    done();
}

// Updated exports
exports.clean = gulp.series(clean);
exports.cleanRoot = cleanRoot;
exports.vendor = gulp.series(vendor);
exports.scripts = gulp.series(scripts);
exports.styles = gulp.series(styles);
exports.updateCacheToken = updateCacheToken;
exports.compile = gulp.series(clean, vendor, scripts, styles);

// Complete build process
exports.build = gulp.series(
    cleanRoot,                // Clean root directory and remove old zips
    clean,                    // Clean assets
    vendor,                   // Copy vendor files
    scripts,                  // Compile JS
    styles,                   // Compile CSS
    updateCacheToken,         // Update cache token
    createBuildStructure,     // Copy files to build directory
    installComposer,          // Install PHP dependencies
    optimizeGoogleServices,   // Optimize Google services
    finalCleanup,            // Clean up dev files
    createArchive,           // Create archives
    build                    // Log completion
);

exports.dev = gulp.series(clean, vendor, scripts, styles, watch);
exports.default = exports.dev;
