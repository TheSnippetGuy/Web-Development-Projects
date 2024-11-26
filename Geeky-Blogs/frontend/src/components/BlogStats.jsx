function BlogStats({ stats }) {
  return (
    <div className="flex gap-2 max-lg:mb-6 max-lg:pb-6 border-grey max-lg:border-b">
      {Object.keys(stats).map((key, i) =>
        !key.includes("parent") ? (
          <div
            key={i}
            className={`flex flex-col items-center w-full h-full justify-center p-4 px-6 ${
              i !== 0 ? "border-grey border-l" : ""
            }`}
          >
            <h1 className="text-xl lg:text-2xl mb-2">{stats[key].toLocaleString()}</h1>
            <p className="max-lg:text-dark-grey capitalize">{key.split("_")[1]}</p>
          </div>
        ) : (
          ""
        )
      )}
    </div>
  );
}

export default BlogStats;
