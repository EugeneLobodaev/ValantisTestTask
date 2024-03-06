import { useEffect, useState } from "react";
import css from "./Tablesheet.module.css";
import { fetchParams } from "../../types/tableSheetTypes";
import { Button } from "../Button";
import { Input } from "../Input/Input";
import axios from "axios";
const md5 = require("md5");

export const Tablesheet = () => {
  // Рассматривал вариант сделать с редаксом, но потратил бы больше времени
  const [search, setSearch] = useState<string>("");
  const [inputValue, setInputValue] = useState<number | string>("");
  const [offset, setOffset] = useState<number>(0);
  const [id, setId] = useState<any[]>();
  const [items, setItems] = useState<fetchParams[]>();
  const tableLimit = 50;
  const url = "http://api.valantis.store:40000";
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const password = "Valantis";
  const authString = md5(password + "_" + timestamp);
  const headers = {
    "X-Auth": authString,
    "Content-Type": "application/json",
  };
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

  const getIds = async () => {
    try {
      const data = {
        action: "get_ids",
        params: { offset: offset, limit: tableLimit },
      };
      const response = await axios.post(`${url}`, data, { headers });
      console.log("res id", response.data.result);
      setId(response.data.result);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const getItems = async () => {
    try {
      const data = {
        action: "get_items",
        params: {
          ids: id,
          limit: tableLimit,
          offset: offset,
        },
      };
      const response = await axios.post(`${url}`, data, { headers });
      console.log("response items", response.data.result, "setting items");
      setItems(response.data.result);
      console.log("items set:", items);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const fetchData = async () => {
    try {
      await getIds();
      await getItems();
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchData();
  }, [offset]);
  return (
    <div className={css.root}>
      <table className={css.table}>
        <tr>
          <th className={css.table_header}>id</th>
          <th className={css.table_header}>name</th>
          <th className={css.table_header}>brand</th>
          <th className={css.table_header}>price</th>
        </tr>
        {items && items.length > 0 ? (
          items.map((el) => (
            <tr className={css.table_header} key={el.id}>
              <td className={css.table_header}>{el.id}</td>
              <td className={css.table_header}>{el.product}</td>
              <td className={css.table_header}>{el.brand}</td>
              <td className={css.table_header}>{el.price}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td>Loading...</td>
          </tr>
        )}
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
      <Input
        type={"search"}
        name={"search"}
        // onChange={(e) => setSearchValue(e.target.value)}
        placeholder={"search"}
        defaultValue={inputValue}
      />
    </div>
  );
};
