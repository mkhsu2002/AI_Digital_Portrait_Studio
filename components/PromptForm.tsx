import React from 'react';
import type { FormDataState } from '../types';
import { CLOTHING_STYLES, EXPRESSIONS, LENSES, LIGHTING_CONDITIONS, ASPECT_RATIOS, BACKGROUNDS, CLOTHING_SEASONS, POSES, MODEL_GENDERS } from '../constants';
import InputGroup from './InputGroup';
import SpinnerIcon from './icons/SpinnerIcon';
import RemoveIcon from './icons/RemoveIcon';


interface PromptFormProps {
  formData: FormDataState;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileRemove: (name: 'faceImage' | 'objectImage') => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const FileInput: React.FC<{
  label: string;
  name: 'faceImage' | 'objectImage';
  file: { name: string } | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileRemove: (name: 'faceImage' | 'objectImage') => void;
}> = ({ label, name, file, onFileChange, onFileRemove }) => {
  return (
    <InputGroup label={label}>
      {!file ? (
        <label htmlFor={name} className="w-full cursor-pointer bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-300 hover:bg-slate-600/70 transition-colors flex justify-center items-center">
          <span>選擇檔案...</span>
          <input id={name} name={name} type="file" onChange={onFileChange} className="sr-only" accept="image/png, image/jpeg" />
        </label>
      ) : (
        <div className="w-full flex items-center justify-between bg-slate-700 border border-slate-600 rounded-md px-3 py-2">
          <span className="text-sm text-slate-200 truncate pr-2">{file.name}</span>
          <button onClick={() => onFileRemove(name)} className="p-1 rounded-full hover:bg-slate-600 text-slate-400 hover:text-slate-100 transition-colors">
            <RemoveIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </InputGroup>
  )
}

const PromptForm: React.FC<PromptFormProps> = ({ formData, onFormChange, onFileChange, onFileRemove, onGenerate, isLoading }) => {
  return (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
      <h2 className="text-2xl font-semibold mb-6 text-slate-200">客製化您的詠唱</h2>
      <div className="space-y-6">
        <InputGroup label="品牌商品名稱">
          <input type="text" name="productName" value={formData.productName} onChange={onFormChange} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
        </InputGroup>

        <InputGroup label="服裝風格">
          <select name="clothingStyle" value={formData.clothingStyle} onChange={onFormChange} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition">
            {CLOTHING_STYLES.map(style => <option key={style} value={style}>{style}</option>)}
          </select>
        </InputGroup>

        <InputGroup label="服裝季節">
          <select name="clothingSeason" value={formData.clothingSeason} onChange={onFormChange} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition">
            {CLOTHING_SEASONS.map(season => <option key={season} value={season}>{season}</option>)}
          </select>
        </InputGroup>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FileInput 
            label="特定人物臉孔 (可選)"
            name="faceImage"
            file={formData.faceImage}
            onFileChange={onFileChange}
            onFileRemove={onFileRemove}
          />
          <FileInput 
            label="特定物品 (可選)"
            name="objectImage"
            file={formData.objectImage}
            onFileChange={onFileChange}
            onFileRemove={onFileRemove}
          />
        </div>

        <InputGroup label="背景環境描述">
           <select name="background" value={formData.background} onChange={onFormChange} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition">
            {BACKGROUNDS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
          </select>
        </InputGroup>

        <InputGroup label="補充描述 (可選)">
          <textarea
            name="additionalDescription"
            value={formData.additionalDescription}
            onChange={onFormChange}
            rows={3}
            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            placeholder="例如：模特兒有著藍色眼睛和金色長髮、背景中有一隻黑色的貓"
          />
        </InputGroup>

        <InputGroup label="模特兒性別">
          <select name="modelGender" value={formData.modelGender} onChange={onFormChange} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition">
            {MODEL_GENDERS.map(gender => <option key={gender} value={gender}>{gender}</option>)}
          </select>
        </InputGroup>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup label="表情描述">
            <select name="expression" value={formData.expression} onChange={onFormChange} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition">
              {EXPRESSIONS.map(exp => <option key={exp} value={exp}>{exp}</option>)}
            </select>
          </InputGroup>
          <InputGroup label="人物姿勢">
            <select name="pose" value={formData.pose} onChange={onFormChange} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition">
              {POSES.map(pose => <option key={pose} value={pose}>{pose}</option>)}
            </select>
          </InputGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputGroup label="鏡頭焦距">
            <select name="lens" value={formData.lens} onChange={onFormChange} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition">
              {LENSES.map(lens => <option key={lens} value={lens}>{lens}</option>)}
            </select>
          </InputGroup>
          <InputGroup label="光線描述">
            <select name="lighting" value={formData.lighting} onChange={onFormChange} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition">
              {LIGHTING_CONDITIONS.map(light => <option key={light} value={light}>{light}</option>)}
            </select>
          </InputGroup>
          <InputGroup label="圖片長寬比">
            <select name="aspectRatio" value={formData.aspectRatio} onChange={onFormChange} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition">
              {ASPECT_RATIOS.map(ratio => <option key={ratio} value={ratio}>{ratio}</option>)}
            </select>
          </InputGroup>
        </div>
      </div>
      <div className="mt-8">
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed"
          aria-live="polite"
        >
          {isLoading ? (
            <>
              <SpinnerIcon className="w-5 h-5 animate-spin" />
              正在產生圖片...
            </>
          ) : (
            '產生圖片'
          )}
        </button>
      </div>
    </div>
  );
};

export default PromptForm;