import { useContext } from "react";
import Editor from "./Editor";
import FileNameList from "./FileNameList";
import { AIStudioContext } from "../../AIStudioContext";
import { debounce } from "lodash-es";

export default function CodeEditor() {

    const { 
        files, 
        setFiles, 
        selectedFileName    } = useContext(AIStudioContext)

    const file = files[selectedFileName];

    function onEditorChange(value?: string) {
        files[file.name].value = value!
        setFiles({ ...files })
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <FileNameList/>
            <Editor file={file} onChange={debounce(onEditorChange,500)} options={{
                theme: `vs-light`
            }}/>
        </div>
    )
}