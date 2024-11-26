import Embed from "@editorjs/embed";
import List from "@editorjs/list";
import Image from "@editorjs/image";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";

async function uploadImageByURL(e) {
  let link = new Promise((resolve, reject) => {
    try {
      resolve(e);
    } catch (err) {
      reject(err);
    }
  });

  return link.then((url) => {
    return { success: 1, file: { url } };
  });
}

function uploadImageByFile(e) {
  console.log(e);
}

export const Tools = {
  embed: Embed,
  list: { class: List, inlineToolbar: true },
  image: {
    class: Image,
    config: {
      uploader: { uploadByUrl: uploadImageByURL, uploadByFile: uploadImageByFile },
    },
  },
  header: { class: Header, config: { placeholder: "Type Heading..." }, levels: [2, 3], defaultLevel: 2 },
  quote: { class: Quote, inlineToolbar: true },
  marker: Marker,
  inlineCode: InlineCode,
};
