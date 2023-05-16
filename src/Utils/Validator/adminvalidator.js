
import joi from "joi";

export const designationValidator = joi.object({
    title: joi.string().required(),
    
  });