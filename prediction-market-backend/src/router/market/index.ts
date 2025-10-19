import { Router } from "express";
import { market } from "../../controller";
import { proposeValidator } from "../../middleware/proposeValidator";

const router = Router();

router.post("/create", proposeValidator, market.create_market);
router.post("/add", market.additionalInfo);
router.post("/addLiquidity", market.addLiquidity);
router.post("/betting", market.betting);
router.post("/liquidity", market.addLiquidity);
router.get("/get", market.getMarketData);

export default router;