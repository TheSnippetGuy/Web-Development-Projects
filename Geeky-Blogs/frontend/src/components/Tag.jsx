import React from "react";
import { useEditor } from "../context/EditorContext";

function Tag({ tag, tagIndex }) {
  let { blog, setBlog } = useEditor();
  let { tags } = blog;

  function handleDelete() {
    tags = tags.filter((cur) => cur !== tag);
    setBlog({ ...blog, tags });
  }

  function handleTagEdit(e) {
    if (e.keyCode === 13 || e.keyCode === 188) {
      e.preventDefault();

      let currentTag = e.target.innerText;
      tags[tagIndex] = currentTag;
      setBlog({ ...blog, tags });
      e.target.setAttribute("contentEditable", false);
    }
  }

  function addEditable(e) {
    e.target.setAttribute("contentEditable", true);
    e.target.focus();
  }

  return (
    <div className="relative p-2 mt-2 mr-2 px-5 bg-white rounded-full inline-block hover:bg-opacity-50 pr-10">
      <p className="outline-none" onKeyDown={handleTagEdit} onClick={addEditable}>
        {tag}
      </p>
      <button className="mt-[2px] rounded-full absolute right-3 top-1/2 -translate-y-1/2" onClick={handleDelete}>
        <i className="fi fi-br-cross text-sm pointer-events-none" />
      </button>
    </div>
  );
}

export default Tag;
