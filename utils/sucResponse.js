const sucResponse = (res, statusCode , data) => {
    res.status(statusCode).json({
        success: true,
        ...data
    })
}

export default sucResponse;