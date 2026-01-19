import { useEffect, useState } from "react";
import { fetchAudio } from "../services/api";

export default function AudioPlayer({ filename }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let active = true;

    fetchAudio(filename).then((blob) => {
      if (active) {
        setUrl(URL.createObjectURL(blob));
      }
    });

    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [filename]);

  if (!url) {
    return <p className="text-slate-400">Loading audio…</p>;
  }

  return <audio controls className="w-full" src={url} />;
}
