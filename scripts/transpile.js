const
    path = require('path'),
    glob = require('glob'),
    babel = require('babel-core'),
    fs = require('fs-extra'),
    minimist = require('minimist');

function displayHelp() {
    console.log('  Usage');
    console.log('    npm run transpile [options]');
    console.log();
    console.log('  Options');
    console.log('    -h, --help        Display help information');
    console.log();
    process.exit(0);
}

module.exports = function(args) {
    const opts = minimist(args, {
        boolean: ['h', 'help'],
        alias: {h:'help'}
    });
    opts.help && displayHelp();

    const sourceRoot = './src';
    const buildRoot = './lib';

    console.log('Transpiling via Babel from ' + path.resolve(sourceRoot) + ' to ' + path.resolve(buildRoot));
    fs.copy(sourceRoot, buildRoot, {stopOnErr:true}, cpErr => {
        if(cpErr) {
            console.error(cpErr);
        } else {
            glob(buildRoot + '/**/*.js', {nodir:true}, (globErr, files) => {
                if(globErr) {
                    console.error(globErr);
                } else {
                    const babelrc = path.join(__dirname, '..', 'config', '.babelrc');
                    files.forEach(js => {
                        babel.transformFile(
                                js, {
                                    extends:babelrc,
                                    presets:[require.resolve('babel-preset-env')],
                                    plugins:[require.resolve('babel-plugin-transform-class-properties')]
                                },
                                (babelErr, result) => {
                            if(babelErr) {
                                console.error(babelErr);
                            } else {
                                console.log('Transpiling ' + js);
                                fs.writeFile(js, result.code, {encoding:'utf8'}, fsErr => {
                                    if(fsErr) {
                                        console.error(fsErr);
                                    }
                                });
                            }
                        });
                    });
                }
            });
        }
    });
};
