const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const AProduct = require("../models/auctionprod");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.aproductById = (req, res, next, id) => {
    AProduct.findById(id)
        .populate("category")
        .exec((err, aproduct) => {
            if (err || !aproduct) {
                return res.status(400).json({
                    error: "Product not found"
                });
            }
            req.aproduct = aproduct;
            next();
        });
};

exports.aread = (req, res) => {
    req.aproduct.photo = undefined;
    return res.json(req.aproduct);
};

exports.acreate = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: "Image could not be uploaded"
            });
        }
        // check for all fields
        const {
            name,
            description,
            sbid,
            category,
            quantity,
            shipping
        } = fields;

        if (
            !name ||
            !description ||
            !sbid ||
            !category ||
            !quantity ||
            !shipping
        ) {
            return res.status(400).json({
                error: "All fields are required"
            });
        }

        let aproduct = new AProduct(fields);

        // 1kb = 1000
        // 1mb = 1000000

        if (files.photo) {
            // console.log("FILES PHOTO: ", files.photo);
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: "Image should be less than 1mb in size"
                });
            }
            aproduct.photo.data = fs.readFileSync(files.photo.path);
            aproduct.photo.contentType = files.photo.type;
        }

        aproduct.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(result);
        });
    });
};

exports.aremove = (req, res) => {
    let aproduct = req.aproduct;
    aproduct.remove((err, deletedProduct) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: "Product deleted successfully"
        });
    });
};

exports.aupdate = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: "Image could not be uploaded"
            });
        }
        // check for all fields
        const {
            name,
            description,
            sbid,
            category,
            quantity,
            shipping
        } = fields;

        if (
            !name ||
            !description ||
            !sbid ||
            !category ||
            !quantity ||
            !shipping
        ) {
            return res.status(400).json({
                error: "All fields are required"
            });
        }

        let aproduct = req.aproduct;
        aproduct = _.extend(aproduct, fields);

        // 1kb = 1000
        // 1mb = 1000000

        if (files.photo) {
            // console.log("FILES PHOTO: ", files.photo);
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: "Image should be less than 1mb in size"
                });
            }
            aproduct.photo.data = fs.readFileSync(files.photo.path);
            aproduct.photo.contentType = files.photo.type;
        }

        aproduct.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(result);
        });
    });
};

/**
 * sell / arrival
 * by sell = /products?sortBy=sold&order=desc&limit=4
 * by arrival = /products?sortBy=createdAt&order=desc&limit=4
 * if no params are sent, then all products are returned
 */

exports.alist = (req, res) => {
    let order = req.query.order ? req.query.order : "asc";
    let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;

    AProduct.find()
        .select("-photo")
        .populate("acategory")
        .sort([[sortBy, order]])
        .limit(limit)
        .exec((err, aproducts) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found"
                });
            }
            res.json(aproducts);
        });
};

/**
 * it will find the products based on the req product category
 * other products that has the same category, will be returned
 */

exports.alistRelated = (req, res) => {
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;

    AProduct.find({ _id: { $ne: req.aproduct }, acategory: req.aproduct.acategory })
        .limit(limit)
        .populate("acategory", "_id name")
        .exec((err, aproducts) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found"
                });
            }
            res.json(aproducts);
        });
};

exports.alistCategories = (req, res) => {
    AProduct.distinct("acategory", {}, (err, acategories) => {
        if (err) {
            return res.status(400).json({
                error: "Categories not found"
            });
        }
        res.json(acategories);
    });
};

/**
 * list products by search
 * we will implement product search in react frontend
 * we will show categories in checkbox and price range in radio buttons
 * as the user clicks on those checkbox and radio buttons
 * we will make api request and show the products to users based on what he wants
 */

exports.alistBySearch = (req, res) => {
    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    let findArgs = {};

    // console.log(order, sortBy, limit, skip, req.body.filters);
    // console.log("findArgs", findArgs);

    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === "price") {
                // gte -  greater than price [0-10]
                // lte - less than
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                };
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }

    AProduct.find(findArgs)
        .select("-photo")
        .populate("acategory")
        .sort([[sortBy, order]])
        .skip(skip)
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found"
                });
            }
            res.json({
                size: data.length,
                data
            });
        });
};

exports.photo = (req, res, next) => {
    if (req.aproduct.photo.data) {
        res.set("Content-Type", req.aproduct.photo.contentType);
        return res.send(req.aproduct.photo.data);
    }
    next();
};

exports.alistSearch = (req, res) => {
    // create query object to hold search value and category value
    const query = {};
    // assign search value to query.name
    if (req.query.search) {
        query.name = { $regex: req.query.search, $options: "i" };
        // assigne category value to query.category
        if (req.query.acategory && req.query.acategory != "All") {
            query.acategory = req.query.acategory;
        }
        // find the product based on query object with 2 properties
        // search and category
        AProduct.find(query, (err, aproducts) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(aproducts);
        }).select("-photo");
    }
};

exports.adecreaseQuantity = (req, res, next) => {
    let bulkOps = req.body.order.aproducts.map(item => {
        return {
            updateOne: {
                filter: { _id: item._id },
                update: { $inc: { quantity: -item.count, sold: +item.count } }
            }
        };
    });

    AProduct.bulkWrite(bulkOps, {}, (error, aproducts) => {
        if (error) {
            return res.status(400).json({
                error: "Could not update product"
            });
        }
        next();
    });
};
