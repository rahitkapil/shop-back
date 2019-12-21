const ACategory = require("../models/auctioncat");
const { errorHandler } = require("../helpers/dbErrorHandler");
const { decrypt } = require("../crypto");
exports.acategoryById = (req, res, next, id) => {
    ACategory.findById(id).exec((err, category) => {
        if (err || !acategory) {
            return res.status(400).json({
                error: "Category does not exist"
            });
        }
        req.acategory = acategory;
        next();
    });
};

exports.acreate = (req, res) => {
    const acategory = new ACategory(req.body);
    acategory.save((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({ data });
    });
};

exports.aread = (req, res) => {
    return res.json(req.acategory);
};

exports.aupdate = (req, res) => {
    const acategory = req.acategory;
    acategory.name = req.body.name;
    acategory.save((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(data);
    });
};

exports.aremove = (req, res) => {
    const acategory = req.acategory;
    acategory.aremove((err, data) => {
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

exports.alist = (req, res) => {
    ACategory.find().exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(data);
    });
};
