// import { useState } from "react";
// import ProductForm from "../../features/admin/ProductForm";

// export default function Dashboard() {
//   const [products, setProducts] = useState<any[]>([]);

//   const addProduct = (data: any) => {
//     setProducts([...products, { ...data, id: Date.now() }]);
//   };

//   return (
//     <div className="container mt-4">
//       <h2>Admin Panel</h2>

//       <ProductForm onSubmit={addProduct} />

//       <div className="mt-4">
//         {products.map((p) => (
//           <div key={p.id}>{p.title}</div>
//         ))}
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import OverviewCards from "./OverviewCards";
import ChartsSection from "./ChartsSection";
import PerformanceInsights from "./PerformanceInsights";
import RecentAdminActivity from "./RecentAdminActivity";

export default function Dashboard() {
  return (
    <div className="container mt-4">
      <h3 className="section-subtitle mb-4">Overview</h3>
      <OverviewCards />

      <h3 className="section-subtitle mt-5 mb-4">Customer Growth Trends</h3>
      <ChartsSection />
      <PerformanceInsights />
      <RecentAdminActivity />
    </div>
  );
}
