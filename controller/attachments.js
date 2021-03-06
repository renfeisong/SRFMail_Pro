var fs = require('fs');
var path = require('path');
var Attachment = require('../model').attachment;
var Log = require('../lib/log')();
var multiparty = require('multiparty');
var router = new require('express').Router();
var uuid = require('uuid');

var download = function(req, res, next) {
    var id = req.query.id;
    Attachment.model.findOne({
        contentId: id
    }, function(err, file) {
        if(err) {
            Log.e({req: req}, err);
            return res.json({
                code: 1,
                message: err.toString()
            })
        }
        fs.exists(path.join(__dirname, '../attachments', file.saveId), function(exist) {
            if(!exist) {
                return res.status(404).send('');
            }
            var fileStream = fs.createReadStream(path.join(__dirname, '../attachments', file.saveId));
            var date = new Date(Date.now() + 24*60*60*1000);
            var date1 = new Date();
            res.header('Content-Type', file.contentType);
            res.header('Cache-Control', 'max-age=604800');
            res.header('Date', date1.toUTCString());
            res.header('Expires', date.toUTCString());
            res.header('Content-Disposition', 'attachment;filename=' + file.name);
            fileStream.pipe(res);
        });
    });
};

var upload = function(req, res) {
    var form = new multiparty.Form();
    var count = 0;
    var ret = {
        code: 0,
        message: 'success'
    };
    var file;

    form.on('part', function(part) {
        if (!part.filename) {
            console.log('got field named ' + part.name);
            part.resume();
        }
        if (part.filename) {
            var name = uuid.v1();
            var stream = fs.createWriteStream(path.join(__dirname, '../attachments', name));
            ret.file = name;
            file = {
                saveId: name,
                name: part.filename,
                contentType: part.headers['content-type'],
                contentId: name,
                type: Attachment.Type.Out
            };
            part.pipe(stream);
        }
        part.on('error', function(err) {
            Log.e(err);
            ret.code = -1;
            ret.message = 'Internal error'
        });
    });

    form.on('close', function() {
        if(!file) {
            return res.json(ret);
        }
        Attachment.model.create(file, function(err) {
            if(err) {
                Log.e(err);
                return res.json({
                    code: 1,
                    message: err.toString()
                });
            }
            res.json(ret);
        });
    });

    form.parse(req);
};

router.get('/download', download);
router.post('/upload', upload);

exports = module.exports = router;