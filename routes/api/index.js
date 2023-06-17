const stand = require("./stand/");

const routeCombiner = [
  {
    route: "/api/stand",
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
