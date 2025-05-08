import express from 'express';
import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from "crypto";
import { Types } from "mongoose";
import { TripModel, TripImage } from '../models/map/trip';

const tripRouter = express.Router();


// 이미지 저장 설정
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, 'images/');
  },
  filename: (req: any, file: any, cb: any) => {
    const userId = req.user.id;
    const ext = path.extname(file.originalname);

    const hash = crypto.createHash('sha256').update(file.originalname).digest('hex')

    const uniqueName = `${userId}_${Date.now()}_${hash}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });
tripRouter.post('/trip', upload.array('images'), async (req, res) => {
/*  #swagger.tags = ['Trip']                                         */
/*  #swagger.summary = '새 여행 생성'                                 */
/*  #swagger.security = [{ BearerAuth: [] }]                         */
/*  #swagger.consumes = ['multipart/form-data']                     */
/*  #swagger.parameters['images'] = {
        in: 'formData',
        type: 'array',
        items: { type: 'file' },
        required: true,
        description: '여행 사진들'
    }                                                               */
/*  #swagger.parameters['imageOrders'] = {
        in: 'formData',
        type: 'array',
        items: { type: 'integer' },
        description: '각 사진의 순번'
    }                                                               */
/*  #swagger.parameters['thumbIndex'] = {
        in: 'formData',
        type: 'integer',
        required: true,
        description: '썸네일로 사용할 인덱스'
    }                                                               */
/*  #swagger.parameters['startDate'] = {
        in: 'formData',
        type: 'string',
        format: 'date',
        required: true,
        description: '여행 시작일 (YYYY-MM-DD)'
    }                                                               */
/*  #swagger.parameters['endDate'] = {
        in: 'formData',
        type: 'string',
        format: 'date',
        required: true,
        description: '여행 종료일 (YYYY-MM-DD)'
    }                                                               */
/*  #swagger.parameters['memo'] = {
        in: 'formData',
        type: 'string',
        description: '메모'
    }                                                               */
/*  #swagger.parameters['sigunguCode'] = {
        in: 'formData',
        type: 'integer',
        required: true,
        description: '시군구 코드'
    }                                                               */
/*  #swagger.parameters['centerX'] = {
        in: 'formData',
        type: 'number',
        format: 'float',
        required: true,
        description: '지도 중심 경도'
    }                                                               */
/*  #swagger.parameters['centerY'] = {
        in: 'formData',
        type: 'number',
        format: 'float',
        required: true,
        description: '지도 중심 위도'
    }                                                               */
/*  #swagger.responses[201] = {
        description: 'Trip 생성 성공',
        schema: { $ref: '#/definitions/Trip' }
    }                                                               */
/*  #swagger.responses[500] = {
        description: '서버 오류',
        schema: { $ref: '#/definitions/Error' }
    }                                                               */
      
  try {
    const {
        thumbIndex,
        startDate,
        endDate,
        memo,
        sigunguCode,
        centerX,
        centerY
    } = req.body;

    const rawOrders = req.body.imageOrders;
    const orders: number[] = Array.isArray(rawOrders)
        ? rawOrders.map((v: string) => Number(v))
        : rawOrders
          ? [Number(rawOrders)]
          : [];

    const userId = new Types.ObjectId(req.user?.id)


    const files = req.files as Express.Multer.File[] || [];
    const images: TripImage[] = files.map((file, i) => ({
        filename: file.filename,
        order: orders[i] != null ? orders[i] : i
    }));

    const thumbImage = images[thumbIndex].filename;

    images
    .sort((a, b) => a.order - b.order)
    .forEach((img, idx) => { img.order = idx });


    const tripData = await TripModel.create({
        author: userId,
        images,
        thumbImage: thumbImage,
        startDate: new Date(startDate),
        endDate:   new Date(endDate),
        memo,
        sigunguCode: Number(sigunguCode),
        centerX:     parseFloat(centerX),
        centerY:     parseFloat(centerY)
    });

    res.ok(201, "", {tripData})
  } catch (error) {
    console.error('Trip 저장 오류:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});


tripRouter.patch('/trip/:id', upload.array('images'), async (req, res) => {
/*  #swagger.tags = ['Trip']
*/
    try {
        const { tripId } = req.params;
        const userId = req.user?.id;
  
        // 1) Trip 문서 조회
        const trip = await TripModel.findOne({ _id: tripId, author: userId });
        if (!trip) {
          res.status(404).json({ message: 'Trip not found' });
          return
        }

        // 2) 유지할 이미지 파싱
        let existing: TripImage[] = [];
        if (req.body.existing) {
            existing = typeof req.body.existing === 'string'
            ? JSON.parse(req.body.existing)
            : req.body.existing;
        }

        // 3) 이미지 삭제
        const keepNames = existing.map(e => e.filename);
        for (const img of trip.images) {
            if (!keepNames.includes(img.filename)) {
                const filePath = path.join(__dirname, '../../images', img.filename);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }
        }

        // 4) 이미지 순서 파싱
        const files = (req.files as Express.Multer.File[]) || [];
        const rawOrders = req.body.imageOrders;
        const orders: number[] = Array.isArray(rawOrders)
            ? rawOrders.map((v: string) => Number(v))
            : rawOrders
                ? [Number(rawOrders)]
                : [];

        const uploaded: TripImage[] = files.map((file, i) => ({
            filename: file.filename,
            order: orders[i] != null ? orders[i] : existing.length + i,
        }));

        const merged = [...existing, ...uploaded]
        .sort((a, b) => a.order - b.order)
        .map((img, idx) => ({ filename: img.filename, order: idx }));

        
        // 6) 필드 업데이트

        if(req.body.thumbIndex)  trip.thumbImage = merged[req.body.thumbIndex].filename
        if (req.body.startDate)  trip.startDate  = new Date(req.body.startDate);
        if (req.body.endDate)    trip.endDate    = new Date(req.body.endDate);
        if (req.body.memo)       trip.memo       = req.body.memo;
        if (req.body.sigunguCode)trip.sigunguCode= Number(req.body.sigunguCode);
        if (req.body.centerX)    trip.centerX    = parseFloat(req.body.centerX);
        if (req.body.centerY)    trip.centerY    = parseFloat(req.body.centerY);
        trip.images = merged;

        // 7) 저장 후 응답
        await trip.save();
        res.json({ success: true, message: 'Trip updated', trip });
    } catch (err: any) {

    }
})

tripRouter.delete('/trip/:id', async (req, res) => {
/*  #swagger.tags = ['Trip']                                         */

    const { id } = req.params;
    const userId = req.user?.id;

    let tripId: Types.ObjectId;
    try {
        tripId = new Types.ObjectId(id);
    } catch (err: any) {
        res.status(400).json({ success: false, message: "유효하지 않은 trip ID"})
        return
    }

    try {
        const trip = await TripModel.findOneAndDelete({
            _id: tripId,
            author: new Types.ObjectId(userId)
        });

        if(!trip) {
            res.status(400).json({ success: false, message: "trip del error"})
            return
        }

        res.json({ success: true, message: "여행이 삭제되었습니다." });
    } catch (err: any) {
        res.status(500).json({ success: false, message: "서버 오류로 삭제에 실패했습니다." });
    }
});

tripRouter.get('/trip', async (req: Request, res: Response) => {
/*  #swagger.tags = ['Trip']
*/
    try {
        const userId = req.user?.id;
        const { lastSync } = req.query;

        if (!lastSync || typeof lastSync !== 'string') {
            res.error(400, 'lastSync 쿼리 파라미터가 필요합니다.');
            return
        }

        const since = new Date(lastSync);
        if (isNaN(since.getTime())) {
            res.error(400, 'lastSync가 유효한 날짜 형식이 아닙니다.');
            return
        }

        const trips = await TripModel.find({
            author: userId,
            updatedAt: { $gt: since }
        }).sort({ updatedAt: 1 });

        res.ok(200, "", {trips});
    } catch (err: any) {
        res.error(400, err.message);
    }
});

tripRouter.get('/tripImage/:filename', async(req, res) => {
/*  #swagger.tags = ['Trip']                                         */
    const filePath = path.join(__dirname, '../../images', req.params.filename);
    res.sendFile(filePath)
})


export default tripRouter;
