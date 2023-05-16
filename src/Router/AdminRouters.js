import { Router,application } from "express";
import { AdminMiddleware } from "./Middleware/AuthMiddleware.js";
import AdminController from "../Controller/AdminController.js";


export let AdminRouters = Router();


application.prefix = Router.prefix = function (path, middleware, configure) {
    configure(AdminRouters);
    this.use(path, middleware, AdminRouters);
    return AdminRouters;
  };
  
  AdminRouters.prefix("/admin", AdminMiddleware, async function () {
    
    AdminRouters.route("/register").post(AdminController.registerUser);    
    AdminRouters.route("/designation").post(AdminController.adddesignation);    
    AdminRouters.route("/designation").get(AdminController.getdesignation);    
    AdminRouters.route("/designation/:id").patch(AdminController.updatedesignation);    
    AdminRouters.route("/designation/:id").delete(AdminController.deletedesignation);    

  });
