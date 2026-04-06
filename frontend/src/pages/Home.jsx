import { useEffect, useState } from "react";
import client from "../api/client";
import ProductCard from "../components/ProductCard";
import { FiFilter, FiSearch } from "react-icons/fi";

const categories = ["", "T-Shirt", "Pants", "Jacket", "Shoes"];
const sizes = ["", "S", "M", "L", "XL"];

const categoryLabels = {
  "T-Shirt": "Áo thun",
  Pants: "Quần",
  Jacket: "Áo khoác",
  Shoes: "Giày",
};

export default function Home() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [size, setSize] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    search();
  }, []);

  const search = async () => {
    const res = await client.get("/products", {
      params: {
        q,
        category: category || undefined,
        size: size || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
      },
    });
    setList(res.data);
  };

  return (
    <section>
      <div className="toolbar card">
        <input
          placeholder="Tìm sản phẩm, thương hiệu..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn" onClick={search}>
          <FiSearch /> Tìm kiếm
        </button>
      </div>

      <div className="card filter-panel">
        <div className="filter-head">
          <p className="section-label">
            <FiFilter /> Bộ lọc sản phẩm
          </p>
        </div>
        <div className="filter-grid">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Tất cả danh mục</option>
            {categories.slice(1).map((item) => (
              <option key={item} value={item}>
                {categoryLabels[item] || item}
              </option>
            ))}
          </select>
          <select value={size} onChange={(e) => setSize(e.target.value)}>
            <option value="">Tất cả size</option>
            {sizes.slice(1).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <input
            type="number"
            step="10000"
            min="0"
            placeholder="Giá tối thiểu"
            value={minPrice}
            onChange={(e) =>
              setMinPrice(Math.max(0, Number(e.target.value) || 0))
            }
          />
          <input
            type="number"
            step="10000"
            min="0"
            placeholder="Giá tối đa"
            value={maxPrice}
            onChange={(e) =>
              setMaxPrice(Math.max(0, Number(e.target.value) || 0))
            }
          />
          <button className="btn" onClick={search}>
            Áp dụng bộ lọc
          </button>
        </div>
      </div>

      <div className="grid">
        {list.map((p, i) => (
          <ProductCard key={i} product={p} />
        ))}
      </div>
    </section>
  );
}
