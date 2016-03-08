/*
 * https://github.com/zero-g/grunt-component
 *
 * Copyright (c) 2015 zero-g
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
    var crypto = require('crypto');
    var path = require('path');
    var fs = require('fs');
    var findup = require('findup-sync');
    var template = require('ali-arttemplate');
    var cssmin = require('cssmin');

    grunt.registerMultiTask('component', 'profile', function() {
        var options = this.options({
        });
        this.files.forEach(function(filePair) {
            filePair.src.forEach(function(distFile) {
                var fileSource = fs.readFileSync(distFile, 'utf-8');
                fileSource = parse(distFile, fileSource);
                fs.writeFileSync(distFile, fileSource);
            });
        });
        function parse(distFile, source) {
            source = source.replace(/__inline\([^\)].*\)/mg, function(matchString, index) {
                var compFile = matchString.match(/__inline\(["']([^"^']*)/)[1];
                compFile = path.join(path.dirname(distFile), compFile); //以目标文件做相对路径

                var compileSource = '';
                if(/\.css$/.test(compFile)) {
                    compileSource = compileCss(compFile);
                } else {
                    compileSource = compileTmpl(compFile);
                }
                return compileSource;
            });
            return source;
        }
        function compileCss(compFile) {
            var result = fs.readFileSync(compFile, 'utf-8');
            result = cssmin(result);
            result = result.replace(/\'/g, '"');

            return "__inline('" + result + "')";
        }
        function compileTmpl(compFile) {
            var result = fs.readFileSync(compFile, 'utf-8');

            var content = template.compile(result).toString().replace(/^function anonymous/, 'function');
            content = content.replace("'use strict';", '');
            return '[' + content + '][0]';
        }

    });
};
