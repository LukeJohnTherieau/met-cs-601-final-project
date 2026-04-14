import {Collection, Db, MongoClient} from "mongodb";
import { JobApplicationProps } from "@/types";

const MONGO_URI = process.env.MONGO_URI as string;

if(!MONGO_URI){
    throw new Error("Something is wrong with your key");
}

const DB_NAME = "met-cs-601";

export const JOB_APPLICATION_COLLECTION = "job-application-collection";

let client: MongoClient | null=null;
let db: Db | null=null;

async function connect(): Promise<Db> {
    // If `client` is not yet initialized, create a new MongoClient instance
    // and connect to MongoDB using the provided URI.
    if (!client) {
        client = new MongoClient(MONGO_URI);
        await client.connect();
    }
    // Return the database instance for the specified database name.
    return client.db(DB_NAME);
}


export default async function getCollection(collectionName: string): Promise<Collection<JobApplicationProps>> {
    // If `db` is not yet initialized, call `connect` to establish the connection.
    if (!db) {
        db = await connect();
    }
    // Return the requested collection from the database.
    return db.collection<JobApplicationProps>(collectionName);
}