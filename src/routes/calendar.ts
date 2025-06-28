import mongoose from "mongoose";

import { Router } from "express";
import { Types } from "mongoose";
import { ScheduleModel } from "../models/calendar/schedule";
import { TodoModel } from "../models/calendar/todo";
import { DiaryModel } from "../models/calendar/diary";

export const calendarRouter = Router();

calendarRouter.post('/schedule', async (req, res) => {
/*  #swagger.tags = ['Calendar']
*/
    try {
        const { title, startDate, endDate, memo, color, shared } = req.body;

        const userId = new Types.ObjectId(req.user?.id)
        const sharedIds = (shared as string[]).map(id => new Types.ObjectId(id));

        const schedule = await ScheduleModel.create({
            author:    userId,
            title,
            startDate: new Date(startDate),
            endDate:   new Date(endDate),
            memo,
            color,
            shared:    sharedIds,
        });

        res.ok(201);
    } catch (err: any) {
        console.error("Schedule create error:", err);
        res.error(400, "err.message")
    }
});

calendarRouter.patch('/schedule/:id', async (req, res) => { 
/*  #swagger.tags = ['Calendar']
*/
    const { id } = req.params;
    const userId = req.user?.id;

    const updates: Partial<{
        title: string;
        startDate: Date;
        endDate:   Date;
        memo:      string;
        color:     number;
        shared:    Types.ObjectId[];
    }> = {};

    if (req.body.title !== undefined) {
    updates.title = req.body.title;
    }
    if (req.body.startDate) {
    updates.startDate = new Date(req.body.startDate);
    }
    if (req.body.endDate) {
    updates.endDate = new Date(req.body.endDate);
    }
    if (req.body.memo !== undefined) {
    updates.memo = req.body.memo;
    }
    if (req.body.color !== undefined) {
    updates.color = req.body.color;
    }
    if (Array.isArray(req.body.shared)) {
    updates.shared = req.body.shared.map((id: string) =>
        new Types.ObjectId(id)
    );
    }

    try {
    const schedule = await ScheduleModel.findOneAndUpdate(
        {
        _id: new Types.ObjectId(id),
        author: new Types.ObjectId(userId),
        },
        { $set: updates },
        { new: true }
    );

    if (!schedule) {
        res.error(404, "찾을 수 없거나 권한이 없습니다.");
        return;
    }

    res.ok(200);

    } catch (err: any) {
        console.error("Schedule update error:", err);
        res.error(400, err.message);
        return;
    }
});

calendarRouter.delete('/schedule/:id', async (req, res) => {
/*  #swagger.tags = ['Schedule']
*/
    const { id } = req.params;
    const userId = req.user?.id;

    let scheduleId: Types.ObjectId;
    try {
        scheduleId = new Types.ObjectId(id);
    } catch (err: any) {
        res.error(400, "유효하지 않은 ID");
        return;
    }

    try {
        // 작성자(author)와 일치하는지 확인하며 삭제
        const result = await ScheduleModel.findOneAndDelete({
        _id:    scheduleId,
        author: new Types.ObjectId(userId),
        });

        if (!result) {
        // 문서가 없거나 권한 없는 경우
        res.error(404, "삭제할 스케줄을 찾을 수 없거나 권한이 없습니다.");
        return;
        }

        res.json({ success: true, message: "스케줄이 삭제되었습니다." });
    } catch (err: any) {
        console.error("Schedule delete error:", err);
        res.error(500, "서버 오류로 삭제에 실패했습니다.");
    }
});

calendarRouter.post('/todo', async (req, res) => {
/*  #swagger.tags = ['Calendar']
*/
    try {
        const { title, isDone, endDate, memo, color, shared } = req.body;

        const userId = new Types.ObjectId(req.user?.id)
        const sharedIds = (shared as string[]).map(id => new Types.ObjectId(id));

        const todo = await TodoModel.create({
            author:    userId,
            title,
            endDate:   new Date(endDate),
            memo,
            isDone:    isDone,
            color,
            shared:    sharedIds,
        });

        res.ok(201);
    } catch (err: any) {
        console.error("todo create error:", err);
        res.error(400, err.message);
    }
});

calendarRouter.patch('/todo/:id', async (req, res) => { 
/*  #swagger.tags = ['Calendar']
*/
    const { id } = req.params;
    const userId = req.user?.id;

    const updates: Partial<{
        title: string;
        endDate:   Date;
        memo:      string;
        isDone:    boolean;
        color:     number;
        shared:    Types.ObjectId[];
    }> = {};

    if (req.body.title !== undefined) {
        updates.title = req.body.title;
    }
    if (req.body.endDate) {
        updates.endDate = new Date(req.body.endDate);
    }
    if (req.body.memo !== undefined) {
        updates.memo = req.body.memo;
    }
    if (req.body.isDone !== undefined) {
        updates.isDone = req.body.isDone
    }
    if (req.body.color !== undefined) {
        updates.color = req.body.color;
    }
    if (Array.isArray(req.body.shared)) {
        updates.shared = req.body.shared.map((id: string) =>
            new Types.ObjectId(id)
        );
    }

    try {
    const todo = await TodoModel.findOneAndUpdate(
        {
        _id: new Types.ObjectId(id),
        author: new Types.ObjectId(userId),
        },
        { $set: updates },
        { new: true }
    );

    if (!todo) {
        res.error(404, "찾을 수 없거나 권한이 없습니다.");
        return;
    }

    res.ok(200);

    } catch (err: any) {
      res.error(400, err.message);
    }
});

calendarRouter.delete('/todo/:id', async (req, res) => {
/*  #swagger.tags = ['Calendar']
*/
    const { id } = req.params;
    const userId = req.user?.id;

    let todoId: Types.ObjectId;
    try {
        todoId = new Types.ObjectId(id);
    } catch (err: any) {
        res.error(400, "유효하지 않은 TODO ID");
        return;
    }

    try {
        // 작성자(author)와 일치하는지 확인하며 삭제
        const result = await TodoModel.findOneAndDelete({
        _id:    todoId,
        author: new Types.ObjectId(userId),
        });

        if (!result) {
        // 문서가 없거나 권한 없는 경우
        res.error(404, "삭제할 할일을 찾을 수 없거나 권한이 없습니다.");
        return;
        }

        res.ok(200, "할일이 삭제되었습니다.");
    } catch (err: any) {
        res.error(500, "서버 오류로 할일 삭제에 실패했습니다.");
    }
});

calendarRouter.post('/diary', async (req, res) => {
/*  #swagger.tags = ['Calendar']
*/
    try {
        const { date, content, shared } = req.body;

        const userId = new Types.ObjectId(req.user?.id)
        const sharedIds = (shared as string[]).map(id => new Types.ObjectId(id));

        const diary = await DiaryModel.create({
            author:    userId,
            date:      new Date(date),
            content,
            shared:    sharedIds,
        });

        res.ok(201);

    } catch (err: any) {
        console.error("todo create error:", err);
        res.error(400, err.message);
    }
});

calendarRouter.patch('/diary/:id', async (req, res) => { 
/*  #swagger.tags = ['Calendar']
*/
    const { id } = req.params;
    const userId = req.user?.id;

    const updates: Partial<{
        content: string
    }> = {};

    if (req.body.content !== undefined) {
        updates.content = req.body.content;
    }

    try {
    const diary = await DiaryModel.findOneAndUpdate(
        {
        _id: new Types.ObjectId(id),
        author: new Types.ObjectId(userId),
        },
        { $set: updates },
        { new: true }
    );

    if (!diary) {
        res.error(404, "찾을 수 없거나 권한이 없습니다.");
        return;
    }

    res.ok(200)

    } catch (err: any) {
        console.error("Schedule update error:", err);
        res.error(400, err.message);
    }
});

calendarRouter.delete('/diary/:id', async (req, res) => {
/*  #swagger.tags = ['Calendar']
*/
    const { id } = req.params;
    const userId = req.user?.id;

    let diaryId: Types.ObjectId;
    try {
        diaryId = new Types.ObjectId(id);
    } catch (err: any) {
        res.error(400, "유효하지 않은 Diary ID");
        return;
    }

    try {
        // 작성자(author)와 일치하는지 확인하며 삭제
        const result = await DiaryModel.findOneAndDelete({
        _id:    diaryId,
        author: new Types.ObjectId(userId),
        });

        if (!result) {
        // 문서가 없거나 권한 없는 경우
        res.error(404, "삭제할 일기를 찾을 수 없거나 권한이 없습니다.");
        return;
        }

        res.ok(200, "일기가 삭제되었습니다.");
    } catch (err: any) {
        res.error(500, "서버 오류로 일기 삭제에 실패했습니다.");
    }
});


calendarRouter.get('/calendar', async (req, res) => {
/*  #swagger.tags = ['Calendar']
*/
    try {
        const { startDate, endDate } = req.query;
        const userId = req.user?.id;

        if(!startDate || !endDate) {
            res.error(400, 'startDate와 endDate를 모두 제공해야 합니다.');
            return
        }

        const start = new Date(startDate as string);
        const end = new Date(endDate as string);

        // todo: endDate가 범위 안에 있는 항목
        const todos = await TodoModel.find({
            author: userId,
            endDate: {
                $gte: start,
                $lte: end
            }
        });

        // schedule: startDate 또는 endDate가 범위 안에 있는 항목
        const schedules = await ScheduleModel.find({
            author: userId,
            $or: [
                { startDate: { $gte: start, $lte: end } },
                { endDate: { $gte: start, $lte: end } }
            ]
        });

        // diary: date가 범위 안에 있는 항목
        const diaries = await DiaryModel.find({
            author: userId,
            date: {
                $gte: start,
                $lte: end
            }
        });

        res.ok(200, "", {
            todos,
            schedules,
            diaries
        });

    } catch (err: any) {
        res.error(500, "조회 중 에러 발생");
    }
});

type OpPayload = {
    type: 'todo' | 'schedule' | 'diary'
    method: String
    id: String
}

calendarRouter.post('/sync', async (req, res) => {
    try {

        const userId = req.user?.id;
        const {
            todos     = [] as Array<Record<string, any>>,
            schedules = [] as Array<Record<string, any>>,
            diaries   = [] as Array<Record<string, any>>
        } = req.body

        const ops: OpPayload[] = req.body.ops || [];

        const modelMap: Record<'todo'|'schedule'|'diary', mongoose.Model<any>> = {
            todo:     TodoModel,
            schedule: ScheduleModel,
            diary:    DiaryModel
        };

        for (const {type, method, id} of ops) {
            const Model = modelMap[type]

            if(method == "delete") {
                await Model.deleteOne({
                    author: userId,
                    id: id
                }).exec()
            }
        }

        async function upsertAndReturn<T extends mongoose.Document>(
            Model: mongoose.Model<T>,
            items: Array<Record<string, any>>,
            key: string = 'id'
        ): Promise<T[]> {
            if (!items.length) return []

            const promises = items.map(item => {
                const filter: Record<string, any> = { author: userId }

                let id: Types.ObjectId
                if(item[key]) {
                    id = new Types.ObjectId(item[key])
                } else {
                    id = new Types.ObjectId()
                    item[key] = id
                }

                filter['_id'] = id

                return Model.findOneAndUpdate(
                    filter,
                    { $set: { ...item, author: userId } },
                    {
                        new: true,
                        upsert: true,
                        setDefaultsOnInsert: true
                    }
                ).exec() as Promise<T>
            })

            const docs = await Promise.all(promises);
            return docs;
        }

        const [updatedTodos, updatedSchedules, updatedDiaries] = await Promise.all([
            upsertAndReturn(TodoModel,     todos),
            upsertAndReturn(ScheduleModel, schedules),
            upsertAndReturn(DiaryModel,    diaries),
        ]);
        

        res.ok(200, "", {
            todos: updatedTodos,
            schedules: updatedSchedules,
            diaries: updatedDiaries
        });

    } catch (err: any) {
        res.error(400, "동기 작업에 실패했습니다.");
    }
});