const errorHandler = (err, req, res, next) => {
    try {
        res.status(err.statusCode || 500).json({
            success : false,
            message : err.message || "Server Error."
        });
    } catch (error) {
        console.log(error);
    }
}

export default errorHandler;