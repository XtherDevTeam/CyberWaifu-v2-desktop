import React, { useState, useEffect } from "react";
import { monaco } from 'react-monaco-editor';
import MonacoEditor from "react-monaco-editor";

const ContentEditor = ({ height, width, mode, language, value, onChange, options, onErr }) => {
  const editorRef = React.useRef(null);
  return <MonacoEditor
    height={height}
    width={width}
    theme={mode === "dark" ? "vs-dark" : "vs"}
    language={language}
    value={value}
    onChange={onChange}
    options={{
      minimap: { enabled: false },
      wordWrap: "on",
      ...options
    }}
    editorDidMount={(editor, monaco) => {
      // bind editorRef
      editorRef.current = editor;
    }}
  />
}

export default ContentEditor;