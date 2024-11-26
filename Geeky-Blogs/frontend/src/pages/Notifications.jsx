import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";
import { filterPaginationData } from "../common/filter-pagination-data";
import Loader from "../components/Loader";
import PageAnimation from "../common/PageAnimation";
import NotificationCard from "../components/NotificationCard";
import NoData from "../components/NoData";
import LoadMore from "../components/LoadMore";

function Notifications() {
  let filters = ["all", "like", "comment", "reply"];
  let { userAuth, setUserAuth } = useUser();
  let { accessToken, new_notification_available } = userAuth;

  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState(null);
  async function fetchNotifications({ page, deletedDocCount = 0 }) {
    try {
      const response = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/user/notifications",
        {
          page,
          filter,
          deletedDocCount,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.status === "success") {
        if (new_notification_available) {
          setUserAuth({ ...userAuth, new_notification_available: false });
        }

        let formattedData = await filterPaginationData({
          state: notifications,
          page,
          data: response.data.notifications,
          countRoute: "/user/all-notifications-count",
          data_to_send: { filter },
          user: accessToken,
        });

        setNotifications(formattedData);
      }
    } catch (error) {
      console.log(error);
    }
  }

  function handleFilter(e) {
    let btn = e.target;
    setFilter(btn.innerHTML);
    setNotifications(null);
  }

  useEffect(() => {
    if (accessToken) {
      fetchNotifications({ page: 1 });
    }
  }, [accessToken, filter]);

  return (
    <div>
      <h1 className="max-md:hidden">Recent Notifications</h1>
      <div className="my-8 flex gap-6">
        {filters.map((filterName, i) => (
          <button
            className={`py-2  ${filter === filterName ? "btn-dark" : "btn-light"}`}
            key={i}
            onClick={handleFilter}
          >
            {filterName}
          </button>
        ))}
      </div>

      {notifications === null ? (
        <Loader />
      ) : (
        <>
          {notifications.results.length ? (
            notifications.results.map((notification, i) => (
              <PageAnimation key={i} transition={{ delay: i * 0.08 }}>
                <NotificationCard
                  data={notification}
                  index={i}
                  notificationState={{ notifications, setNotifications }}
                />
              </PageAnimation>
            ))
          ) : (
            <NoData message="No New Notification" />
          )}
          <LoadMore
            state={notifications}
            fetchDataFun={fetchNotifications}
            additionalParam={{ deletedDocCount: notifications.deletedDocCount }}
          />
        </>
      )}
    </div>
  );
}

export default Notifications;
