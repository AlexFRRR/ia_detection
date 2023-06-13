const stand = require("./stand/");

const routeCombiner = [
  {
    route: "/api/stand/add",
    router: stand,
  },
];

class Router {
  static initialize(app) {
    routeCombiner.forEach((routeCombiner) => {
      app.use(routeCombiner.route, routeCombiner.router);
    });
  }
}

module.exports = Router;
