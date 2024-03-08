import { useEffect, useState } from "react";
import css from "./Tablesheet.module.css";
import { fetchParams } from "../../types/tableSheetTypes";
import { Button } from "../Button";
import { Input } from "../Input/Input";
import axios from "axios";

const md5 = require("md5");
const tableLimit = 50;
const url = "http://api.valantis.store:40000";
const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const password = "Valantis";
const authString = md5(password + "_" + timestamp);
const headers = {
  "X-Auth": authString,
  "Content-Type": "application/json",
};

export const Tablesheet = () => {
  // Рассматривал вариант сделать с редаксом, но потратил бы больше времени
  const [search, setSearch] = useState<string>("");
  const [inputValue, setInputValue] = useState<number | string>("");
  const [offset, setOffset] = useState<number>(1);
  const [id, setId] = useState<any[]>();
  const [fields, setFields] = useState<any[]>()
  const [items, setItems] = useState<fetchParams[]>();

  const nextPage = (): void => {
    setOffset((prev: number) => prev + 50);
  };
  const prevPage = (): void => {
    if (offset < 50) {
      return;
    } else {
      setOffset((prev: number) => prev - 50);
    }
  };

 const getFields = async() => {
  try {
    const data = {
      action: "get_fields"
    }
    const response = await axios.post(url, data, {headers})
  }
  catch (error ) {
    console.log("ошиьбка получения полей:", error)
  }
 }
  const getIds = async () => {
    try {
      const data = {
        action: "get_ids",
        params: { offset: offset, limit: tableLimit
      }}
      const response = await axios.post(`${url}`, data, { headers })
      console.log(response.data.result)
      //убираем дубликаты
      const createSetResponse = new Set<string>(response.data.result)
      // @ts-ignore
      const clearedResponse = [...createSetResponse]
      console.log(clearedResponse)
    setId(clearedResponse);
    } catch (error) {
      console.error("ошибка запроса ИД:", error);
      getIds()
    }
  };
  const getItems = async () => {
    try {
      const data = {
        action: "get_items",
        params: {
          ids: id
        },
      };
      const response = await axios.post(`${url}`, data, { headers });
      setItems(response.data.result);
    } catch (error) {
      console.error("ошибка запроса товара:", error);
    }
  };
    const getFilteredIds = async () => {
    const data = {
      action : "filter",
      params : {
      product: inputValue,
      limit: tableLimit, // этот параметр не работает в фильтрации, при запросе приходит огромный массив
    }
    }
    try{   
    const response = await axios.post(url, data, {headers})
    setId(response.data.result)
    setInputValue("")
  }
catch(error) {
  console.log("ошибка запроса:",error)
  getFields()
}
  }
  
  useEffect(() => {
     getIds();
  }, [offset]);

  useEffect(() => {
    getItems()
  },[id])
  if (!items) {
    return (
      <div className={css.root}>
        <span className={css.fallback}>Loading...</span>
      </div>
    )}
    else {
      return (
    <div className={css.root}>
      <table className={css.table}>
          <th className={css.table_header}>id</th>
          <th className={css.table_header}>name</th>
          <th className={css.table_header}>brand</th>
          <th className={css.table_header}>price</th>
          {items.map((el) => (
            <tr className={css.table_row} key={el.id}>
              <td className={css.table_row}>{el.id}</td>
              <td className={css.table_row}>{el.product}</td>
              <td className={css.table_row}>{el.brand}</td>
              <td className={css.table_row}>{el.price}</td>
            </tr>
          ))}
      </table>
      <div className={css.button_wrapper}>
        <Button
          disabled={offset < 50}
          onClick={() => prevPage()}
          className={css.button}
          name={"Previous Page"}
        />
        <Button
          onClick={() => nextPage()}
          disabled={offset > 8000}
          className={css.button}
          name={"Next Page"}
        />
      </div>
      <form action="submit" onSubmit={(e) => {
        e.preventDefault();
        getFilteredIds();
        
      }}>
        <Input
        type={"search"}
        name={"search"}
        onChange={(e) => setInputValue(e.currentTarget.value)}
        placeholder={"search"}
        value={inputValue}
      />
      </form>
      <Button onClick={() => getFilteredIds()} className={css.button} name="Search"/>
      <Button onClick={() => {
        setOffset(0)
        getIds()
        setInputValue("")}} 
        name="Reset" className={css.button}/>
    </div>
      )
    }
  }
