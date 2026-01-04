import React from "react";
import type { FormDataState } from "../types";
import {
  CLOTHING_STYLES,
  EXPRESSIONS,
  LIGHTING_CONDITIONS,
  ASPECT_RATIOS,
  BACKGROUNDS,
  BACKGROUND_CATEGORIES,
  CLOTHING_SEASONS,
  FEMALE_POSES,
  MALE_POSES,
  MODEL_GENDERS,
  IMAGE_MODELS,
} from "../constants";
import InputGroup from "./InputGroup";
import SpinnerIcon from "./icons/SpinnerIcon";
import RemoveIcon from "./icons/RemoveIcon";
import BackgroundSelect from "./BackgroundSelect";
import { useTranslation } from "../contexts/TranslationContext";

interface PromptFormProps {
  formData: FormDataState;
  onFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileRemove: (name: "faceImage" | "objectImage") => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const FileInput: React.FC<{
  label: string;
  name: "faceImage" | "objectImage";
  file: { name: string; data?: string; mimeType?: string } | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileRemove: (name: "faceImage" | "objectImage") => void;
  selectLabel: string;
  removeLabel: string;
}> = ({ label, name, file, onFileChange, onFileRemove, selectLabel, removeLabel }) => {
  const previewUrl = file?.data 
    ? `data:${file.mimeType || 'image/png'};base64,${file.data}` 
    : null;

  return (
    <InputGroup label={label}>
      {!file ? (
        <label
          htmlFor={name}
          className="w-full cursor-pointer bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-300 hover:bg-slate-600/70 transition-colors flex justify-center items-center"
        >
          <span>{selectLabel}</span>
          <input
            id={name}
            name={name}
            type="file"
            onChange={onFileChange}
            className="sr-only"
            accept="image/png, image/jpeg"
          />
        </label>
      ) : (
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between bg-slate-700 border border-slate-600 rounded-md px-3 py-2">
            <span className="text-sm text-slate-200 truncate pr-2">{file.name}</span>
            <button
              type="button"
              onClick={() => onFileRemove(name)}
              className="p-1 rounded-full hover:bg-slate-600 text-slate-400 hover:text-slate-100 transition-colors flex-shrink-0"
              aria-label={removeLabel}
            >
              <RemoveIcon className="w-4 h-4" />
            </button>
          </div>
          {previewUrl && (
            <div className="bg-slate-700 border border-slate-600 rounded-md p-2">
              <img
                src={previewUrl}
                alt={`${label} preview`}
                className="w-full h-32 object-contain rounded"
                loading="lazy"
                decoding="async"
              />
            </div>
          )}
        </div>
      )}
    </InputGroup>
  );
};

const PromptForm: React.FC<PromptFormProps> = React.memo(({
  formData,
  onFormChange,
  onFileChange,
  onFileRemove,
  onGenerate,
  isLoading,
}) => {
  const { t, translateOption } = useTranslation();

  return (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
      <h2 className="text-2xl font-semibold mb-6 text-slate-200">{t.form.title}</h2>
      <div className="space-y-6">
        <InputGroup label={t.form.productName}>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={onFormChange}
            maxLength={100}
            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            placeholder="例如：登山後背包"
          />
        </InputGroup>

        <InputGroup label={t.form.clothingStyle}>
          <select
            name="clothingStyle"
            value={formData.clothingStyle}
            onChange={onFormChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          >
            {CLOTHING_STYLES.map((style) => (
              <option key={style} value={style}>
                {translateOption("clothingStyle", style)}
              </option>
            ))}
          </select>
        </InputGroup>

        <InputGroup label={t.form.clothingSeason}>
          <select
            name="clothingSeason"
            value={formData.clothingSeason}
            onChange={onFormChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          >
            {CLOTHING_SEASONS.map((season) => (
              <option key={season} value={season}>
                {translateOption("clothingSeason", season)}
              </option>
            ))}
          </select>
        </InputGroup>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FileInput
            label={t.form.faceImage}
            name="faceImage"
            file={formData.faceImage}
            onFileChange={onFileChange}
            onFileRemove={onFileRemove}
            selectLabel={t.form.selectFile}
            removeLabel={t.form.removeFile}
          />
          <FileInput
            label={t.form.objectImage}
            name="objectImage"
            file={formData.objectImage}
            onFileChange={onFileChange}
            onFileRemove={onFileRemove}
            selectLabel={t.form.selectFile}
            removeLabel={t.form.removeFile}
          />
        </div>

        <InputGroup label={t.form.background}>
          <BackgroundSelect
            value={formData.background}
            onChange={(value) => {
              const syntheticEvent = {
                target: { name: 'background', value },
              } as React.ChangeEvent<HTMLSelectElement>;
              onFormChange(syntheticEvent);
            }}
            name="background"
          />
        </InputGroup>

        <InputGroup label={t.form.additionalDescription}>
          <textarea
            name="additionalDescription"
            value={formData.additionalDescription}
            onChange={onFormChange}
            rows={3}
            maxLength={500}
            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            placeholder={t.form.additionalPlaceholder}
          />
          <div className="text-xs text-slate-400 mt-1 text-right">
            {formData.additionalDescription.length}/500
          </div>
        </InputGroup>

        <InputGroup label={t.form.modelGender}>
          <select
            name="modelGender"
            value={formData.modelGender}
            onChange={onFormChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          >
            {MODEL_GENDERS.map((gender) => (
              <option key={gender} value={gender}>
                {translateOption("modelGender", gender)}
              </option>
            ))}
          </select>
        </InputGroup>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup label={t.form.expression}>
            <select
              name="expression"
              value={formData.expression}
              onChange={onFormChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            >
              {EXPRESSIONS.map((exp) => (
                <option key={exp} value={exp}>
                  {translateOption("expression", exp)}
                </option>
              ))}
            </select>
          </InputGroup>
          <InputGroup label={t.form.pose}>
            <select
              name="pose"
              value={formData.pose}
              onChange={onFormChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            >
              {(formData.modelGender === "女性模特兒" ? FEMALE_POSES : MALE_POSES).map((pose) => (
                <option key={pose} value={pose}>
                  {translateOption("pose", pose)}
                </option>
              ))}
            </select>
          </InputGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup label={t.form.lighting}>
            <select
              name="lighting"
              value={formData.lighting}
              onChange={onFormChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            >
              {LIGHTING_CONDITIONS.map((light) => (
                <option key={light} value={light}>
                  {translateOption("lighting", light)}
                </option>
              ))}
            </select>
          </InputGroup>
          <InputGroup label={t.form.aspectRatio}>
            <select
              name="aspectRatio"
              value={formData.aspectRatio}
              onChange={onFormChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            >
              {ASPECT_RATIOS.map((ratio) => (
                <option key={ratio} value={ratio}>
                  {ratio}
                </option>
              ))}
            </select>
          </InputGroup>
        </div>

        <InputGroup label={t.form.imageModel}>
          <select
            name="imageModel"
            value={formData.imageModel}
            onChange={onFormChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          >
            {IMAGE_MODELS.map((model) => (
              <option key={model} value={model}>
                {translateOption("imageModel", model)}
              </option>
            ))}
          </select>
        </InputGroup>
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
              {t.form.generating}
            </>
          ) : (
            t.form.generateButton
          )}
        </button>
      </div>
    </div>
  );
});

PromptForm.displayName = 'PromptForm';

export default PromptForm;
