const WCategory = require("../models/womancat");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.wcategoryById = (req, res, next, id) => {
    WCategory.findById(id).exec((err, category) => {
        if (err || !wcategory) {
            return res.status(400).json({
                error: "Category does not exist"
            });
        }
        req.wcategory = wcategory;
        next();
    });
};

exports.wcreate = (req, res) => {
    const wcategory = new WCategory(req.body);
    wcategory.save((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({ data });
    });
};

exports.wread = (req, res) => {
    return res.json(req.wcategory);
};

exports.wupdate = (req, res) => {
    const wcategory = req.wcategory;
    wcategory.name = req.body.name;
    wcategory.save((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(data);
    });
};

exports.wremove = (req, res) => {
    const wcategory = req.wcategory;
    wcategory.wremove((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: "Category deleted"
        });
    });
};

exports.wlist = (req, res) => {
    WCategory.find().exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(data);
    });
};
