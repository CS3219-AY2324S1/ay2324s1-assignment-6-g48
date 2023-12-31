import { Router, NextFunction, Request, Response } from "express";
import Question from "../../models/Question";
import logger from "../../utils/logger";
import axios from "axios";
import { Role } from "../../models/enum/Role";
import { AuthenticatedRequest, jwtGuard } from "../../guard/jwtGuard";

export const questionRouter = Router();

// Gets question from mongodb
questionRouter.get("/", jwtGuard, async (req: AuthenticatedRequest, res: Response) => {
  // Todo: enhance security
  const user = req.user;
  if (!Object.values(Role).includes(user?.role as Role)) {
    res.status(401).json({ error: "Only registered users are allowed to view questions." });
    return;
  }

  Question.find({}).then((question) => {
    res.status(200).json(question);
  });
});

questionRouter.get("/leetcode", async (req: Request, res: Response) => {
  // Remember to login before invoking this function as you need permisssions (command: firebase login)
  // SERVER IS DOWN
  try {
    const response = await axios.get(
      "https://asia-southeast1-cs3219-398215.cloudfunctions.net/leetcodeQuestionsFetch"
    );
    const transformData = response.data.map((question: any) => ({
      id: question.question_id.toString(),
      title: question.question_title,
      description: "[Please click here to view the question](https://leetcode.com/problems/" + question.question__title_slug + "/description/)",
      categories: [],
      complexity: (() => {
        switch (question.difficulty) {
          case 1:
            return "Easy";
          case 2:
            return "Medium";
          case 3:
            return "Hard";
          default:
            return "";
        }
      })(),
      examples: [""],
      constraints: "",
      followUp: "",
      starterCode: [],
      testcases: [{ input: "", output: "" }],
      dateCreated: new Date()
    }));
    res.status(200).json(transformData);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
});

// Fetches individual question by id
questionRouter.get(
  "/:id", jwtGuard,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!Object.values(Role).includes(user?.role as Role)) {
      res.status(401).json({ error: "Only registered users are allowed to view questions." });
      return;
    }

    logger.info(`Finding question id ${req.params.id}`);
    Question.findById(req.params.id)
      .then((question) => {
        if (question) {
          res.status(200).json(question);
        } else {
          res.status(404).json({
            error: `A question with id ${req.params.id} does not exist`,
          });
        }
      })
      .catch((err) => {
        next(err);
      });
  }
);

// Deletes question from mongodb
questionRouter.delete(
  "/:id", jwtGuard,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (user?.role !== Role.Admin) {
      res.status(401).json({ error: "Only admins are allowed to delete questions." });
      return;
    }

    await Question.findByIdAndRemove(req.params.id)
      .then((question) => {
        if (!question) {
          res.status(404).json({
            error: `A question with id ${req.params.id} does not exist.`,
          });
        }
        res.status(204).json(question);
      })
      .catch((e) => next(e));
  }
);


// Adds question to mongodb
questionRouter.post(
  "/", jwtGuard,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const body = req.body;
    const user = req.user;

    if (user?.role !== Role.Admin) {
      res.status(401).json({ error: "Only admins are allowed to add questions." });
      return;
    }

    const isExisting = await Question.findOne({ title: body.title });

    if (isExisting) {
      res
        .status(400)
        .json({ error: "A question with this title already exists." });
      return;
    }

    const question = new Question({
      title: body.title,
      description: body.description,
      categories: body.categories,
      complexity: body.complexity,
      examples: body.examples,
      constraints: body.constraints,
      followUp: body.followUp,
      starterCode: body.starterCode,
      testcases: body.testcases,
      // A date will be created by default!
    });
    question
      .save()
      .then((savedQuestion) => res.status(201).json(savedQuestion))
      .catch((e) => next(e));
  }
);

// Updates question in mongodb
questionRouter.put(
  "/:id", jwtGuard,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { title, description, categories, complexity, examples, constraints, followUp, starterCode, testcases, dateCreated  } = req.body;
    const id = req.params.id;
    const user = req.user;

    if (user?.role !== Role.Admin) {
      res.status(401).json({ error: "Only admins are allowed to add questions." });
      return;
    }

    await Question.findByIdAndUpdate(
      id,
      { title, description, categories, complexity, examples, constraints, followUp, starterCode, testcases, dateCreated },
      { new: true, runValidators: true, context: "query" }
    )
      .then((updatedQuestion) => {
        if (!updatedQuestion) {
          res
            .status(404)
            .json({ error: `A question with id ${id} does not exist.` });
          return;
        }
        res.status(200).json(updatedQuestion);
      })
      .catch((err) => next(err));
  }
);

questionRouter.post(
  "/:id/run",
  
)
