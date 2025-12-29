import { Request, Response, NextFunction } from "express";
import { ZodObject } from "zod";


const validateResource = (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {

        const result = schema.safeParse({
            body: req.body,
            query: req.query,
            params: req.params
        })

        if (result.success) {
            return next()
        }

        const error = result.error

        return res.status(400).json({
            success: false,
            status: "fail",
            errors: error.issues.map(e => ({
                field: e.path[1] || e.path[0],
                message: e.message
            }))
        })
    } catch (e: any) {
        return res.status(400).send(e.errors);
    }
}

export default validateResource