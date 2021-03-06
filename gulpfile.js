const gulp = require('gulp');
const panini = require('panini');
const plugins = require('gulp-load-plugins');
const del = require('del');
const browser = require('browser-sync');
const dotenv = require('dotenv');
const gulpSitemap = require('gulp-sitemap');
const imageResize = require('gulp-image-resize');

dotenv.config({ silent: true });

const $ = plugins();
const isProd = process.env.NODE_ENV === 'production';

gulp.task('assemble', gulp.series(clean, pages, images, fonts, sass, icons, javascript));
gulp.task('build', gulp.series('assemble', revisionFiles, sitemap, resizeProducts));
gulp.task('default', gulp.series('assemble', server, watch));

// Delete the "dist" folder
// This happens every time a build starts
function clean () {
    return del(['dist/**/*']);
}

function sitemap () {
    return gulp.src('cdn/**/*.html', {
        read: false
    })
    .pipe(gulpSitemap({
        siteUrl: 'https://inkomm.org'
    }))
    .pipe(gulp.dest('./cdn'));
}

function pages () {
    return gulp.src('src/pages/**/*.html')
        .pipe(panini({
            root: 'src/',
            layouts: 'src/layouts/',
            partials: 'src/partials/',
            helpers: 'src/helpers/',
            data: 'src/data/'
        }))
        .pipe(gulp.dest('dist'));
}

// Copy and compress images
function images () {
    return gulp.src('src/assets/img/**/*')
        .pipe(gulp.dest('./dist/img'));
}

function resizeProducts () {
    return gulp.src('cdn/img/products/**/*')
        .pipe(imageResize({
          height: 230,
          interlace: true
        }))
        .pipe(gulp.dest('cdn/img/products/'));
}

function fonts () {
    return gulp.src('src/assets/fonts/**/*')
        .pipe(gulp.dest('./dist/fonts'));
}
function icons () {
    return gulp.src('src/assets/icons/**/*')
        .pipe(gulp.dest('./dist/icons'));
}

function sass () {
    const sassOptions = { includePaths: [
        'node_modules/bootstrap-sass/assets/stylesheets',
        'node_modules/layout-grid/sass',
    ] };

    return gulp.src('src/assets/scss/app.scss')
        .pipe($.if(!isProd, $.sourcemaps.init()))
        .pipe($.sass(sassOptions).on('error', $.sass.logError))
        .pipe($.autoprefixer({ browsers: ['last 2 versions'] }))
        .pipe($.if(isProd, $.uglifycss()))
        .pipe($.if(!isProd, $.sourcemaps.write()))
        .pipe(gulp.dest('dist/css'));
}

function javascript () {
    return gulp.src([
            'node_modules/jquery/dist/jquery.js',
            'node_modules/bootstrap-sass/assets/javascripts/bootstrap/{modal,collapse}.js',
            'src/assets/js/**/*',
        ])
        .pipe($.if(!isProd, $.sourcemaps.init()))
        .pipe($.concat('combined.js'))
        .pipe($.if(isProd, $.uglify()))
        .pipe($.if(!isProd, $.sourcemaps.write()))
        .pipe(gulp.dest('dist/js'));
}

// Start a server with LiveReload to preview the site in
function server (done) {
    browser.init({ server: 'dist' });
    done();
}

// Reset Panini's cache of layouts and partials
function resetPages (done) {
    panini.refresh();
    done();
}

function revisionFiles () {
    return gulp.src('dist/**')
        .pipe($.revAll.revision({
            dontSearchFile: ['.pdf'],
            dontRenameFile: [/social-image.jpg/g, '.html'],
            dontUpdateReference: [/social-image.jpg/g, '.html'],
        }))
        .pipe(gulp.dest('cdn'));
}

// Watch for file changes
function watch() {
    gulp.watch('src/pages/**/*.html').on('all', gulp.series(pages, browser.reload));
    gulp.watch(['src/layouts/**/*', 'src/partials/**/*']).on('all', gulp.series(resetPages, pages, browser.reload));
    gulp.watch(['../scss/**/*.scss', 'src/assets/scss/**/*.scss']).on('all', gulp.series(resetPages, sass, pages, browser.reload));
    gulp.watch('src/assets/fonts/**/*').on('all', gulp.series(fonts, browser.reload));
    gulp.watch('src/assets/img/**/*').on('all', gulp.series(images, browser.reload));
    gulp.watch('src/assets/icons/**/*').on('all', gulp.series(icons, browser.reload));
    gulp.watch('src/assets/js/**/*').on('all', gulp.series(javascript, browser.reload));
}
