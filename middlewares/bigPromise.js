module.exports = (func) = (req, res, next) => {
    Promise.resolve(func(req, res)).catch(next)
}