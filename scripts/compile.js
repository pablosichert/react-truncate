import fs from 'fs';
import { resolve } from 'path';
import browserify from 'browserify';

(browserify(resolve(__dirname, '../src'))
    .transform('babelify')
    .bundle()
    .pipe(fs.createWriteStream(resolve(__dirname, '../dist/bundle.js')))
);
