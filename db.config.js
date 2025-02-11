module.exports = {
    url: process.env.MONGODB_URI,
    database: "financetracker",
    imgBucket: "photos",
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
};