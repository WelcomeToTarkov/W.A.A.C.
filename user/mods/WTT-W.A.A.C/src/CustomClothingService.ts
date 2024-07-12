/* eslint-disable @typescript-eslint/naming-convention */
import { traderIDs, currencyIDs } from "./references/configConsts";
import { WTTInstanceManager } from "./WTTInstanceManager";
import * as fs from "fs";
import * as path from "path";


export class CustomClothingService {
    private Instance: WTTInstanceManager;

    public preSptLoad(Instance: WTTInstanceManager): void {
        this.Instance = Instance;
    }

    public postDBLoad(): void {
        const clothingJsonsPath = path.join(__dirname, "../db/clothing");
        const jsonFiles = fs.readdirSync(clothingJsonsPath).filter(file => file.endsWith(".json"));

        jsonFiles.forEach(jsonFile => {
            const filePath = path.join(clothingJsonsPath, jsonFile);
            try {
                const combinedConfigs = this.readJsonFile(filePath);

                if (Array.isArray(combinedConfigs)) {
                    combinedConfigs.forEach(combinedConfig => {
                        this.processClothingConfig(combinedConfig);
                    });
                }
                else {
                    this.processClothingConfig(combinedConfigs);
                }
                if (this.Instance.debug) {
                    console.log(`Processed ${jsonFile}.`);
                }
            }
            catch (error) {
                console.error(`Error processing ${jsonFile}:`, error);
            }
        });
    }

    private processClothingConfig(combinedConfig: any): void {
        if (this.Instance.debug) {
            console.log(`Processing config of type: ${combinedConfig.type}`);
        }
        if (combinedConfig.type === "top") {
            this.addTop(combinedConfig);
        }
        else if (combinedConfig.type === "bottom") {
            this.addBottom(combinedConfig);
        }
        else {
            console.error("Unknown config type:", combinedConfig.type);
        }
    }

    private addSuiteToTrader(
        traderId: string,
        outfitId: string,
        suiteId: string,
        loyaltyLevel: number,
        profileLevel: number,
        standing: number,
        currencyId: string,
        price: number,
        functionalbool: boolean
    ): void {

        const traderIdFromEnum = traderIDs[traderId as keyof typeof traderIDs] || traderId;
        const currencyIdFromEnum = currencyIDs[currencyId as keyof typeof currencyIDs] || currencyId;

        this.Instance.database.traders[traderIdFromEnum].base.customization_seller = true;

        if (!this.Instance.database.traders[traderIdFromEnum].suits) {
            this.Instance.database.traders[traderIdFromEnum].suits = [];
        }

        this.Instance.database.traders[traderIdFromEnum].suits.push({
            "_id": outfitId,
            "tid": traderIdFromEnum,
            "suiteId": suiteId,
            "isActive": true,
            "requirements": {
                "loyaltyLevel": loyaltyLevel,
                "profileLevel": profileLevel,
                "standing": standing,
                "skillRequirements": [],
                "questRequirements": [],
                "itemRequirements": [
                    {
                        "count": price,
                        "_tpl": currencyIdFromEnum,
                        "onlyFunctional": functionalbool
                    }
                ]
            }
        });
    }

    private addTop(combinedConfig: any): void {
        const { outfitId, name, topBundlePath, handsBaseID, handsBundlePath, traderId, loyaltyLevel, profileLevel, standing, currencyId, price, functionalbool, watchPrefab, watchPosition, watchRotation } = combinedConfig;

        try {
            // add top
            if (this.Instance.debug) {
                console.log(`Adding top for outfitId: ${outfitId}`);
            }
            const DefaultWatchPrefab = {
                "path": "",
                "rcid": ""
              };
            const DefaultWatchPosition = {
                "x": 0,
                "y": 0,
                "z": 0
              };
            const DefaultWatchRotation = {
                "x": 0,
                "y": 0,
                "z": 0
              };
            const newTop = this.Instance.jsonUtil.clone(this.Instance.database.templates.customization["5d28adcb86f77429242fc893"]);

            newTop._id = outfitId;
            newTop._name = outfitId;
            newTop._props.Prefab.path = topBundlePath;
            newTop._props.WatchPrefab = watchPrefab ?? DefaultWatchPrefab;
            newTop._props.WatchPosition = watchPosition ?? DefaultWatchPosition;
            newTop._props.WatchRotation = watchRotation ?? DefaultWatchRotation;

            this.Instance.database.templates.customization[outfitId] = newTop;
            if (this.Instance.debug) {
                console.log(`Added top for outfitId: ${outfitId}`);
            }
            // add hands
            if (this.Instance.debug) {
                console.log(`Adding hands for outfitId: ${outfitId}`);
            }
            const handsTemplate = this.Instance.database.templates.customization[handsBaseID];
            if (!handsTemplate) {
                console.error(`Hands template not found for handsBaseID: ${handsBaseID}`);
                return;
            }

            const newHands = this.Instance.jsonUtil.clone(handsTemplate);
            newHands._id = `${outfitId}Hands`;
            newHands._name = `${outfitId}Hands`;
            newHands._props.Prefab.path = handsBundlePath;
            newHands._props.WatchPrefab = watchPrefab ?? DefaultWatchPrefab;
            newHands._props.WatchPosition = watchPosition ?? DefaultWatchPosition;
            newHands._props.WatchRotation = watchRotation ?? DefaultWatchRotation;
            this.Instance.database.templates.customization[`${outfitId}Hands`] = newHands;
            if (this.Instance.debug) {
                console.log(`Added hands for outfitId: ${outfitId}`);
            }
            // add suite
            const newSuite = this.Instance.jsonUtil.clone(this.Instance.database.templates.customization["5d1f623e86f7744bce0ef705"]);
            newSuite._id = `${outfitId}Suite`;
            newSuite._name = `${outfitId}Suite`;
            newSuite._props.Body = outfitId;
            newSuite._props.Hands = `${outfitId}Hands`;
            newSuite._props.Side = ["Usec", "Bear", "Savage"];

            this.Instance.database.templates.customization[`${outfitId}Suite`] = newSuite;
            this.Instance.database.locales.global["en"][`${outfitId}Suite Name`] = name

            this.addSuiteToTrader(
                traderId,
                outfitId,
                `${outfitId}Suite`,
                loyaltyLevel,
                profileLevel,
                standing,
                currencyId,
                price,
                functionalbool
            );
        }
        catch (error) {
            console.error(`Error adding top for outfitId: ${outfitId}:`, error);
        }
    }

    private addBottom(combinedConfig: any): void {
        const { outfitId, name, bundlePath, traderId, loyaltyLevel, profileLevel, standing, currencyId, price, functionalbool } = combinedConfig;

        // add Bottom
        const newBottom = this.Instance.jsonUtil.clone(this.Instance.database.templates.customization["5d5e7f4986f7746956659f8a"]);

        newBottom._id = outfitId;
        newBottom._name = outfitId;
        newBottom._props.Prefab.path = bundlePath;
        this.Instance.database.templates.customization[outfitId] = newBottom;

        // add suite
        const newSuite = this.Instance.jsonUtil.clone(this.Instance.database.templates.customization["5cd946231388ce000d572fe3"]);

        newSuite._id = `${outfitId}Suite`;
        newSuite._name = `${outfitId}Suite`;
        newSuite._props.Feet = outfitId;
        newSuite._props.Side = ["Usec", "Bear", "Savage"];
        this.Instance.database.templates.customization[`${outfitId}Suite`] = newSuite;
        this.Instance.database.locales.global["en"][`${outfitId}Suite Name`] = name

        this.addSuiteToTrader(
            traderId,
            outfitId,
            `${outfitId}Suite`,
            loyaltyLevel,
            profileLevel,
            standing,
            currencyId,
            price,
            functionalbool
        );
    }

    private readJsonFile(filePath: string): any {
        const content = fs.readFileSync(filePath, "utf-8");

        try {
            const parsedContent = JSON.parse(content);
            if (this.Instance.debug) {
                console.log("Custom Clothing Service: Parsed JSON Content:", parsedContent); // Logging the parsed JSON content
            }
            return parsedContent;
        }
        catch (error) {
            console.error("Error parsing JSON content:", error);
            return null;
        }
    }
}
