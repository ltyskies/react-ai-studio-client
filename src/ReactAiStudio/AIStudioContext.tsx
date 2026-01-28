import { createContext, useEffect, useState, type PropsWithChildren } from 'react'
import { compress, fileName2Language, uncompress } from './utils'
import { initFiles } from './files'

export interface File {
  name: string
  value: string
  language: string
}

export interface Files {
  [key: string]: File
}

export interface AIStudioContext {
  files: Files
  selectedFileName: string
  isShow: boolean
  setIsShow: (show: boolean) => void
  setSelectedFileName: (fileName: string) => void
  setFiles: (files: Files) => void
  addFile: (fileName: string) => void
  removeFile: (fileName: string) => void
  updateFileName: (oldFieldName: string, newFieldName: string) => void
}


export const AIStudioContext = createContext<AIStudioContext>({
  selectedFileName: 'App.tsx',
} as AIStudioContext)


const getFilesFromUrl = () => {
    let files: Files | undefined
    try {
        const hash = uncompress(decodeURIComponent(window.location.hash.slice(1)))
        files = JSON.parse(hash)
    } catch (error) {
        console.error(error)
    }
    return files
}

export const AIStudioProvider = ( props: PropsWithChildren) => {
    const { children } = props
    const [ files, setFiles ] = useState<Files>( getFilesFromUrl() || initFiles)
    const [ selectedFileName, setSelectedFileName ] = useState('App.tsx')
    const [ isShow, setIsShow ] = useState(false)

    const addFile = (name: string) => {
        files[name] = {
            name,
            language: fileName2Language(name),
            value: '',
        }
        setFiles({ ...files })
    }

    const removeFile = (name: string) => {
        delete files[name]
        setFiles({ ...files })
    }

    const updateFileName = (oldFieldName: string, newFieldName: string) => {
        if (!files[oldFieldName] || newFieldName === undefined || newFieldName === null) return
        const { [oldFieldName]: value, ...rest } = files
        const newFile = {
        [newFieldName]: {
            ...value,
            language: fileName2Language(newFieldName),
            name: newFieldName,
        },
        }
        setFiles({
            ...rest,
            ...newFile,
        })
    }

    useEffect(() => {
        const hash = compress(JSON.stringify(files))
        window.location.hash = encodeURIComponent(hash)
    }, [files])

    return (
        <AIStudioContext.Provider
        value={{
            isShow,
            setIsShow,
            files,
            selectedFileName,
            setSelectedFileName,
            setFiles,
            addFile,
            removeFile,
            updateFileName,
        }}
        >
        {children}
        </AIStudioContext.Provider>
    )    

}
