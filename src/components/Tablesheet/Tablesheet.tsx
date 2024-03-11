import { useCallback, useEffect, useState } from "react";
import css from "./Tablesheet.module.css";
import { fetchParams } from "../../types/tableSheetTypes";
import { Button } from "../Button";
import { Input } from "../Input/Input";
import axios from "axios";

const md5 = require("md5");
const TABLE_LIMIT = 50;
const url = "https://api.valantis.store:41000/";
const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const password = "Valantis";
const authString = md5(password + "_" + timestamp);
const headers = {
  "X-Auth": authString,
  "Content-Type": "application/json",
  https: "on",
};

export const Tablesheet = () => {
  // Рассматривал вариант сделать с редаксом, но потратил бы больше времени
  const [nameValue, setNameValue] = useState<string>("");
  const [brandValue, setBrandValue] = useState<string>("");
  const [priceValue, setPriceValue] = useState<any>(null);
  const [offset, setOffset] = useState<number>(0);
  const [id, setId] = useState<string[]>();
  const [items, setItems] = useState<fetchParams[]>([]);
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
  //перехода на конкретную страницу нет т.к нет такого функционала у API
  // это можно сделать на клиенте, но:
  // 1. загрузка большого объема данных (массив из 8000 элементов)
  //2. работа с таким массивом(обрезание и создание переменных не мутируя исходный массив) очень увесистая.
  const getIds = useCallback(async () => {
    setLoading(true);
    try {
      const data = {
        action: "get_ids",
        params: { offset: offset, limit: TABLE_LIMIT },
      };
      const response = await axios.post(url, data, { headers });
      setId(response.data.result);
    } catch (error: any) {
      console.error("ошибка запроса ИД:", error.message);
    } finally {
      setLoading(false);
    }
  }, [offset]);
  const getItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = {
        action: "get_items",
        params: {
          ids: id,
        },
      };
      const response = await axios.post(url, data, {
        headers,
      });
      //чистим массив с товарами
      const filteredItems = response.data.result.filter(
        (item: { id: string }, index: number, self: any[]) =>
          index === self.findIndex((el) => el.id === item.id)
      );
      setItems(filteredItems);
    } catch (error: any) {
      console.error("ошибка запроса Товара:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);
  // все фильтры в один запрос добавить не получилось т.к апи не поддерживает несколько параметров в фильтре (насколько я понял, у меня не получилось так сделать)
  // это можно сделать если получать все 3 массива Id из 3 фильтров и путем перебора и совпадения дубликатов добавлять их в еще один массив и передавать
  // его в getIds для получения Items с учетом всем 3ех фильтров
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
    } finally {
      setLoading(false);
    }
  };
  //поиск по брендам чувствителен к регистру, т.к каждый бренд может содержать непредсказуемый регистр символов в любом из слов, сделать upper/lowercase функцию будет проблематично
  // в идеале ( по моему скоромному мнению), названия должны приводиться к нижнему регистру на стороне сервера и на клиентской стороне для удобства поиска в таких случаях
  // т.е сейчас для поиска по брендам необходимо точно вводить название бренда ( Cartier, Van Cleef & Alpert и тд)
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
      getFilteredPrice();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getIds();
  }, [getIds, offset]);

  useEffect(() => {
    getItems();
  }, [getItems, id]);
  if (loading && items) {
    return (
      <div className={css.root}>
        <div className={css.form_wrapper}>
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
              onChange={(e) => setNameValue(e.currentTarget.value)}
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
                setBrandValue(e.currentTarget.value);
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
              onChange={(e) => setPriceValue(Number(e.currentTarget.value))}
              placeholder={"enter price"}
            />
            <Button
              type="submit"
              onClick={() => getFilteredPrice()}
              className={css.button}
              name="искать по цене"
            />
          </form>
        </div>
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
        <Button
          onClick={() => {
            setNameValue("");
            setBrandValue("");
            setPriceValue(null);
            setItems([]);
            setOffset(0);
            getIds();
          }}
          name="Reset"
          className={css.button}
        />
        <span className="fallback">Loading...</span>
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className={css.root}>
        <div className={css.form_wrapper}>
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
              onChange={(e) => setNameValue(e.currentTarget.value)}
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
                setBrandValue(e.currentTarget.value);
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
              onChange={(e) => setPriceValue(Number(e.currentTarget.value))}
              placeholder={"enter price"}
            />
            <Button
              type="submit"
              onClick={() => getFilteredPrice()}
              className={css.button}
              name="искать по цене"
            />
          </form>
        </div>
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
        <Button
          onClick={() => {
            setNameValue("");
            setBrandValue("");
            setPriceValue(null);
            setItems([]);
            setOffset(0);
            getIds();
          }}
          name="Reset"
          className={css.button}
        />
        <span className="fallback">Товара не найдено</span>
      </div>
    );
  } else {
    return (
      <div className={css.root}>
        <div className={css.form_wrapper}>
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
              onChange={(e) => setNameValue(e.currentTarget.value)}
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
                setBrandValue(e.currentTarget.value);
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
              onChange={(e) => setPriceValue(Number(e.currentTarget.value))}
              placeholder={"enter price"}
            />
            <Button
              type="submit"
              onClick={() => getFilteredPrice()}
              className={css.button}
              name="искать по цене"
            />
          </form>
        </div>
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
        <table className={css.table}>
          <thead>
            <th className={css.table_header}>id</th>
            <th className={css.table_header}>name</th>
            <th className={css.table_header}>brand</th>
            <th className={css.table_header}>price</th>
          </thead>
          <tbody>
            {items.map((el) => (
              <tr className={css.table_row} key={el.id}>
                <td className={css.table_row}>{el.id}</td>
                <td className={css.table_row}>{el.product}</td>
                <td className={css.table_row}>{el.brand}</td>
                <td className={css.table_row}>{el.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
};
