#!/usr/bin/env node

const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

/**
 * Returns true if success or error object.  
 * 
 * @param {String} src - SRC of a file or url to presentation. Default is empty, it needs users creation
 * ```JS
 * callPuppeteer({src:"file:///path/to/file/index.html"})
 * ``` 
 * @param {String} folderToSave - Parameter for where the images should be saved. Default is root of the folder, 
 * where it creates folder `SCREENSHOTS`.
 * ```JS
 * callPuppeteer({folderToSave:"/path/to/file/"})
 * ``` 
 * @param {String} naming - Naming of the screenshots. Default name is: `Screenshot_YYYYMMDD_HHmmSS` 
 * with additional count number from the lenght picked from slide count of `<slide>`
 * 
 */

exports.callPuppeteer= function(src="", folderToSave="", naming=""){

if(folderToSave=="")
try {
    var folder = __dirname.split("/");
    folder.pop();
    folder = folder.join("/");
    folderToSave=folder+"/SCREENSHOTS/"
    if (!fs.existsSync(folderToSave)) {
      fs.mkdirSync(folderToSave);
    }
  } catch (err) {
    return err;
    
  }

    puppeteer.launch({
        defaultViewport: {
            width: 1920,
            height: 1080,
        },
    })
    .then(async (browser) => {
        const page = await browser.newPage();
        await page.goto(src);
        const aHandle = await page.evaluate(() => { return document.getElementsByTagName("section").length });
        await page.evaluate(() => { 
            document.getAnimations().forEach((animation) => {
                animation.finish();
            });
        });
        for (let index = 0; index < aHandle; index++) {
            if(!naming){
                var d = new Date();
                var naming = "Screenshot_" + d.getFullYear() + d.getMonth() + d.getDate() + "_" +
                d.getHours() + d.getMinutes();
            }
                await page.screenshot({ path: folderToSave+datestring+naming+"_"+index + ".jpeg" });
                await page.evaluate(async() => {
                    Reveal.next();
                    document.getAnimations().forEach((animation) => {
                        animation.finish();
                    });
                });
            console.log(index + "-" + aHandle);
        }
        await browser.close();
        return true;
    }).catch((err)=>{
        return err;
    });
}
