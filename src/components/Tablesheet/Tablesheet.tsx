import { useEffect, useState } from "react";
import css from "./Tablesheet.module.css";
import { fetchParams } from "../../types/tableSheetTypes";
import { Button } from "../Button";
import { Input } from "../Input/Input";
import axios from "axios";

const md5 = require("md5");
const TABLE_LIMIT = 50;
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
  const [nameValue, setNameValue] = useState<string>("");
  const [brandValue, setBrandValue] = useState<string>("");
  const [priceValue, setPriceValue] = useState<any>(null);
  const [offset, setOffset] = useState<number>(1);
  const [id, setId] = useState<string[]>();
  const [items, setItems] = useState<fetchParams[]>();
  const [loading, setLoading] = useState<boolean>(false);

  const nextPage = (): void => {
    setOffset((prev: number) => prev + TABLE_LIMIT);
  };
  const prevPage = (): void => {
    if (offset < TABLE_LIMIT) {
      return;
    } else {
      setOffset((prev: number) => prev - TABLE_LIMIT);
    }
  };

  const getFields = async () => {
    try {
      const data = {
        action: "get_fields",
      };
      const response = await axios.post(url, data, { headers });
    } catch (error) {
      console.log("ошиьбка получения полей:", error);
    }
  };
  const getIds = async () => {
    setLoading(true);
    try {
      const data = {
        action: "get_ids",
        params: { offset: offset, limit: TABLE_LIMIT },
      };
      const response = await axios.post(`${url}`, data, { headers });
      //убираем дубликаты
      const createSetResponse = new Set<string>(response.data.result);
      //@ts-ignore
      const clearedResponse = [...createSetResponse];
      console.log(clearedResponse);
      setId(clearedResponse);
    } catch (error: any) {
      console.error("ошибка запроса ИД:", error);
      if (error.response && error.response.status === 400) {
        console.error("Ошибка получения ИД:", error);
        getIds();
      } else {
        console.error("Не удалось получить ИД. Ошибка:", error);
      }
    } finally {
      setLoading(false);
    }
  };
  const getItems = async () => {
    setLoading(true);
    try {
      const data = {
        action: "get_items",
        params: {
          ids: id,
        },
      };
      const response = await axios.post(`${url}`, data, {
        headers,
      });
      setItems(response.data.result);
    } catch (error) {
      console.error("ошибка запроса товара:", error);
    } finally {
      setLoading(false);
    }
  };
  const getFilteredProducts = async () => {
    const data = {
      action: "filter",
      params: {
        product: nameValue,
        limit: TABLE_LIMIT,
      },
    };
    setLoading(true);
    try {
      const response = await axios.post(url, data, { headers });
      setId(response.data.result);
    } catch (error) {
      console.log("ошибка запроса:", error);
      getFields();
    } finally {
      setLoading(false);
    }
  };
  const getFilteredBrand = async () => {
    const data = {
      action: "filter",
      params: {
        brand: brandValue,
        limit: TABLE_LIMIT,
      },
    };
    setLoading(true);
    try {
      const response = await axios.post(url, data, { headers });
      setId(response.data.result);
    } catch (error) {
      console.log("ошибка запроса:", error);
      getFields();
    } finally {
      setLoading(false);
    }
  };
  const getFilteredPrice = async () => {
    const data = {
      action: "filter",
      params: {
        price: priceValue,
        limit: TABLE_LIMIT,
      },
    };
    setLoading(true);
    try {
      const response = await axios.post(url, data, { headers });
      setId(response.data.result);
    } catch (error) {
      console.log("ошибка запроса:", error);
      getFields();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getIds();
  }, [offset]);

  useEffect(() => {
    getItems();
  }, [id]);
  if (!items) {
    return (
      <div className={css.root}>
        <span className={css.fallback}>Loading...</span>
      </div>
    );
  } else {
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
            disabled={offset < 50 || loading}
            onClick={() => prevPage()}
            className={css.button}
            name={"Previous Page"}
          />
          <Button
            onClick={() => nextPage()}
            disabled={offset > 8000 || loading}
            className={css.button}
            name={"Next Page"}
          />
        </div>
        <form
          className={css.form}
          onSubmit={(e) => {
            e.preventDefault();
            getFilteredProducts();
            setNameValue("");
          }}
        >
          <Input
            type={"search"}
            name={"name"}
            value={nameValue}
            onChange={(e) => {
              const inputText = e.currentTarget.value;
              const capitalizedText =
                inputText.charAt(0).toUpperCase() +
                inputText.slice(1).toLowerCase();
              setNameValue(capitalizedText);
            }}
            placeholder={"enter name"}
          />
          <Button
            type="submit"
            onClick={() => getFilteredProducts()}
            className={css.button}
            name="искать по названию"
          />
        </form>
        <form
          className={css.form}
          onSubmit={(e) => {
            e.preventDefault();
            getFilteredBrand();
            setBrandValue("");
          }}
        >
          <Input
            type={"text"}
            name={"brand"}
            value={brandValue}
            onChange={(e) => {
              const inputText = e.currentTarget.value;
              const capitalizedText =
                inputText.charAt(0).toUpperCase() +
                inputText.slice(1).toLowerCase();
              setBrandValue(capitalizedText);
            }}
            placeholder={"enter brand"}
          />
          <Button
            type="submit"
            onClick={() => getFilteredBrand()}
            className={css.button}
            name="искать по бренду"
          />
        </form>

        <form
          className={css.form}
          onSubmit={(e) => {
            e.preventDefault();
            getFilteredPrice();
            setPriceValue("");
          }}
        >
          <Input
            type={"number"}
            name={"price"}
            value={priceValue}
            onChange={(e) => setPriceValue(e.currentTarget.value)}
            placeholder={"enter price"}
          />
          <Button
            type="submit"
            onClick={() => getFilteredPrice()}
            className={css.button}
            name="искать по цене"
          />
        </form>
        <Button
          onClick={() => {
            setOffset(0);
            getIds();
            setNameValue("");
            setBrandValue("");
            setPriceValue(null);
          }}
          name="Reset"
          className={css.button}
        />
      </div>
    );
  }
};
