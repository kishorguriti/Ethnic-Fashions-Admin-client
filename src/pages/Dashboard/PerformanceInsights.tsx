import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import {
  getWishlistByCategory,
  getWishlistInsights,
  type WishlistCategoryShare,
  type WishlistInsight,
} from '../../services/analyticsApi';

ChartJS.register(ArcElement, Tooltip, Legend);

const CATEGORY_COLORS = ['#8b5cf6', '#a800e6', '#ec4899', '#10b981', '#f59e0b'];

const PerformanceInsights: React.FC = () => {
  const [categoryShare, setCategoryShare] = useState<WishlistCategoryShare[]>([]);
  const [topWishlisted, setTopWishlisted] = useState<WishlistInsight[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryRes, wishlistRes] = await Promise.all([
          getWishlistByCategory(3),
          getWishlistInsights(5),
        ]);
        setCategoryShare(categoryRes.data.data);
        setTopWishlisted(wishlistRes.data.data);
      } catch {
        message.error('Failed to load performance insights.');
      }
    };
    fetchData();
  }, []);

  const doughnutData = {
    labels: categoryShare.map((c) => c.name),
    datasets: [
      {
        data: categoryShare.map((c) => c.percentage),
        backgroundColor: categoryShare.map((_, i) => CATEGORY_COLORS[i % CATEGORY_COLORS.length]),
        borderWidth: 0,
        cutout: '70%',
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  const topCategory = categoryShare[0];

  return (
    <div className="analytics-dashboard-extension py-3">

      {/* SECTION A: Performance Insights Header Group */}
      <h2 className="section-title mb-4">Performance Insights</h2>
      <div className="row g-3 mb-5">

        {/* Category Performance Card Block */}
        <div className="col-12 col-xl-4">
          <div className="insight-card p-4 h-100">
            <h4 className="card-subtitle mb-4">Category Performance</h4>
            {categoryShare.length > 0 ? (
              <>
                <div className="chart-canvas-wrapper d-flex justify-content-center align-items-center position-relative">
                  <div className="doughnut-container">
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                  </div>
                  {topCategory && (
                    <div className="center-label text-center position-absolute">
                      <span className="lbl-top">{topCategory.name}</span>
                      <h5 className="lbl-pct mb-0">{topCategory.percentage}%</h5>
                    </div>
                  )}
                </div>
                <div className="chart-legends d-flex justify-content-center flex-wrap gap-3 mt-4">
                  {categoryShare.map((c) => (
                    <span key={c.name} className="legend-dot">
                      {c.name} ({c.percentage}%)
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <span className="text-muted">No wishlist activity yet.</span>
            )}
          </div>
        </div>

        {/* Top Wishlisted Products List Block */}
        <div className="col-12 col-xl-8">
          <div className="insight-card p-4 h-100">
            <h4 className="card-subtitle mb-4">Top Wishlisted Products</h4>
            <div className="product-rankings-stack d-flex flex-column gap-3">
              {topWishlisted.length === 0 && (
                <span className="text-muted">No wishlist activity yet.</span>
              )}
              {topWishlisted.map((prod, index) => (
                <div key={prod.productId} className="ranking-row p-3 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <div className="rank-badge-box d-flex align-items-center justify-content-center">
                      {index + 1}
                    </div>
                    <div>
                      <h6 className="prod-name mb-0">{prod.name}</h6>
                      <span className="prod-category text-muted">{prod.category?.name || 'Uncategorized'}</span>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="prod-revenue">{prod.wishlistCount} wishlists</div>
                    <span className="prod-sales text-muted">{prod.cartCount} in cart</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceInsights;
