import { Router, Request, Response } from "express";
import { Question } from "../models/questionModel";
import { parseQuestionId } from "../utils/parseQuestionId";
import QUESTION_TOPICS from "../models/questionTopics";

const router: Router = Router();

const DUPLICATE_KEY_ERROR_CODE = 11000;

// retrieves entire list of questions
router.get("/", async (req: Request, res: Response): Promise<Response> => {
    try {
        const questions = await Question.find({}).sort({ _id: 1 });

        return res.status(200).send({
            length: questions.length,
            data: questions,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message: "Error retrieving list of questions",
        });
    }
});

// retrieves all unique topics from all questions
router.get(
    "/topics",
    async (req: Request, res: Response): Promise<Response> => {
        return res.status(200).send(QUESTION_TOPICS)
    }
);

// retrieves a specific question by id
router.get("/:id", async (req: Request, res: Response): Promise<Response> => {
    const id = parseQuestionId(req.params.id);

    if (isNaN(id)) {
        return res.status(400).send({
            message: `Invalid ID: ${req.params.id}. Please provide a valid number.`,
        });
    }

    try {
        const question = await Question.findOne({ _id: id });

        if (question === null) {
            return res.status(404).send({
                message: `Question of ID: ${id} does not exist in the database`,
            });
        }
        return res.status(200).send(question);
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message: `Error retrieving question of ID: ${id}`,
        });
    }
});

// create a question
router.post("/", async (req: Request, res: Response): Promise<Response> => {
    const question = req.body;
    if (!question.title || !question.difficulty || !question.description) {
        return res.status(400).send({
            message: "Title, difficulty, and description must not be empty",
        });
    }

    if (question.topics) {
        const invalidTopics = question.topics.filter((topic: string) => {
            return !QUESTION_TOPICS.includes(topic)
        })

        if (invalidTopics.length > 0) {
            return res.status(400).send({
                message: `Invalid topics provided: ${invalidTopics.join(", ")}. Allowed topics are: ${QUESTION_TOPICS.join(", ")}`
            })
        }
    }

    try {
        await Question.create(question);
        return res.status(200).send({
            message: "Question successfully created",
        });
    } catch (error: any) {
        console.log(error);
        if (error.code === DUPLICATE_KEY_ERROR_CODE) {
            return res.status(400).send({
                message: `A question with the title '${question.title}' already exists.`,
            });
        }
        return res.status(500).send({
            message: "Error creating question",
        });
    }
});

// updates a question, identifed by id
router.put("/:id", async (req: Request, res: Response): Promise<Response> => {
    const id = parseQuestionId(req.params.id);
    const question = req.body;

    if (isNaN(id)) {
        return res.status(400).send({
            message: `Invalid ID: ${req.params.id}. Please provide a valid number.`,
        });
    }

    if (!question.title || !question.difficulty || !question.description) {
        return res.status(400).send({
            message: "Title, difficulty, and description must not be empty",
        });
    }

    if (question.topics) {
        const invalidTopics = question.topics.filter((topic: string) => {
            return !QUESTION_TOPICS.includes(topic)
        })

        if (invalidTopics.length > 0) {
            return res.status(400).send({
                message: `Invalid topics provided: ${invalidTopics.join(", ")}. Allowed topics are: ${QUESTION_TOPICS.join(", ")}`
            })
        }
    }

    try {
        const questionResponse = await Question.findByIdAndUpdate(id, question);

        if (questionResponse === null) {
            return res.status(404).send({
                message: `Question of ID: ${id} does not exist in the database`,
            });
        }

        return res.status(200).send({
            message: "Question successfully updated",
        });
    } catch (error: any) {
        console.log(error);
        if (error.code === DUPLICATE_KEY_ERROR_CODE) {
            return res.status(400).send({
                message: `A question with the title '${question.title}' already exists.`,
            });
        }
        return res.status(500).send({
            message: "Error editing question",
        });
    }
});

// deletes a specific question by id
router.delete("/:id", async (req: Request, res: Response): Promise<Response> => {
    const id = parseQuestionId(req.params.id);

    if (isNaN(id)) {
        return res.status(400).send({
            message: `Invalid ID: ${req.params.id}. Please provide a valid number.`,
        });
    }

    try {
        const question = await Question.findByIdAndDelete(id);

        if (question === null) {
            return res.status(404).send({
                message: `Question of ID: ${id} does not exist in the database`,
            });
        }

        return res.status(200).send({
            message: `Successfully deleted question with ID: ${id}`,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message: `Error deleting question of id: ${id}`,
        });
    }
});

export default router;
