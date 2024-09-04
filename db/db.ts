import  knex  from "knex";
import knexFile from "../knexfile";

const environment = process.env.NODE_ENV || "development";

export default knex(knexFile[environment]);