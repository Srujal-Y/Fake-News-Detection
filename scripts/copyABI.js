import fs from "fs";
import path from "path";

const source = "./artifacts/contracts/NewsRegistry.sol/NewsRegistry.json";
const destination = "./frontend/src/abi/NewsRegistry.json";

fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.copyFileSync(source, destination);

console.log("✅ ABI copied to frontend/src/abi/NewsRegistry.json");
