"use client";
import { useState, useEffect, useRef } from "react";
import { addToast } from "@heroui/toast";
import { Switch } from "@heroui/switch";
import { Divider } from "@heroui/divider";

import { DrawerCitricaAdmin } from "@/shared/components/citrica-ui/admin/drawer-citrica-admin";
import { Button, Input } from "citrica-ui-toolkit";
import { Text } from "citrica-ui-toolkit";
import Icon from "@ui/atoms/icon";

import {
  useLandingProjects,
  LandingProject,
  LandingProjectInput,
  ServiceItem,
  TechnologyItem,
} from "@/hooks/landing-projects/use-landing-projects";
import { useUploadImageToStorage } from "@/hooks/use-upload-image-to-storage";

interface LandingProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mode: "create" | "edit";
  project?: LandingProject;
}

interface SectionProps {
  title: string;
  badge?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, badge, children, defaultOpen = false }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-[#D4DEED] rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Text variant="body" weight="bold" color="#265197">{title}</Text>
          {badge !== undefined && (
            <span className="text-xs bg-[#265197] text-white px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} className="w-5 h-5 text-[#265197]" />
      </button>
      {isOpen && <div className="p-4 border-t border-[#D4DEED]">{children}</div>}
    </div>
  );
}

const emptyFormData: LandingProjectInput = {
  slug: "",
  hero_category: "",
  hero_title: "",
  hero_subtitle: "",
  hero_button_label: "Ver Demo",
  hero_image: "",
  description_section_title: "Sobre el Proyecto",
  description_main_title: "",
  description_text: "",
  description_title_color: "#006666",
  description_text_color: "#16141F",
  description_bg_color: "bg-color-ct-tertiary-container",
  description_border_color: "border-[#00666633]",
  challenge_section_title: "El Desafío",
  challenge_image: "",
  challenge_description: "",
  challenge_title_color: "#006666",
  challenge_text_color: "#16141F",
  solution_section_title: "La Solución",
  solution_image: "",
  solution_description: "",
  solution_title_color: "#006666",
  solution_text_color: "#16141F",
  services: [],
  technologies: [],
  is_active: true,
  featured: false,
  sort_order: 0,
};

export default function LandingProjectFormModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  project,
}: LandingProjectFormModalProps) {
  const { createProject, updateProject, isLoading, generateSlug } = useLandingProjects();
  const [formData, setFormData] = useState<LandingProjectInput>(emptyFormData);

  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const challengeImageInputRef = useRef<HTMLInputElement>(null);
  const solutionImageInputRef = useRef<HTMLInputElement>(null);

  const {
    uploadImage: uploadHeroImage,
    uploading: uploadingHero,
    progress: heroProgress,
    error: heroUploadError,
  } = useUploadImageToStorage({
    bucket: "landing-projects",
    folder: "hero-images",
    maxSizeMB: 5,
  });

  const {
    uploadImage: uploadChallengeImage,
    uploading: uploadingChallenge,
    progress: challengeProgress,
    error: challengeUploadError,
  } = useUploadImageToStorage({
    bucket: "landing-projects",
    folder: "challenge-images",
    maxSizeMB: 5,
  });

  const {
    uploadImage: uploadSolutionImage,
    uploading: uploadingSolution,
    progress: solutionProgress,
    error: solutionUploadError,
  } = useUploadImageToStorage({
    bucket: "landing-projects",
    folder: "solution-images",
    maxSizeMB: 5,
  });

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await uploadHeroImage(file);
    if (result) {
      handleInputChange("hero_image", result.url);
      addToast({ title: "Éxito", description: "Imagen subida correctamente", color: "success" });
    } else if (heroUploadError) {
      addToast({ title: "Error", description: heroUploadError, color: "danger" });
    }

    if (heroImageInputRef.current) {
      heroImageInputRef.current.value = "";
    }
  };

  const handleChallengeImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await uploadChallengeImage(file);
    if (result) {
      handleInputChange("challenge_image", result.url);
      addToast({ title: "Éxito", description: "Imagen subida correctamente", color: "success" });
    } else if (challengeUploadError) {
      addToast({ title: "Error", description: challengeUploadError, color: "danger" });
    }

    if (challengeImageInputRef.current) {
      challengeImageInputRef.current.value = "";
    }
  };

  const handleSolutionImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await uploadSolutionImage(file);
    if (result) {
      handleInputChange("solution_image", result.url);
      addToast({ title: "Éxito", description: "Imagen subida correctamente", color: "success" });
    } else if (solutionUploadError) {
      addToast({ title: "Error", description: solutionUploadError, color: "danger" });
    }

    if (solutionImageInputRef.current) {
      solutionImageInputRef.current.value = "";
    }
  };

  const handleRemoveHeroImage = () => {
    handleInputChange("hero_image", "");
  };

  const handleRemoveChallengeImage = () => {
    handleInputChange("challenge_image", "");
  };

  const handleRemoveSolutionImage = () => {
    handleInputChange("solution_image", "");
  };

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && project) {
        setFormData({
          slug: project.slug,
          hero_category: project.hero_category,
          hero_title: project.hero_title,
          hero_subtitle: project.hero_subtitle || "",
          hero_button_label: project.hero_button_label || "Ver Demo",
          hero_image: project.hero_image || "",
          description_section_title: project.description_section_title || "Sobre el Proyecto",
          description_main_title: project.description_main_title || "",
          description_text: project.description_text || "",
          description_title_color: project.description_title_color || "#006666",
          description_text_color: project.description_text_color || "#16141F",
          description_bg_color: project.description_bg_color || "bg-color-ct-tertiary-container",
          description_border_color: project.description_border_color || "border-[#00666633]",
          challenge_section_title: project.challenge_section_title || "El Desafío",
          challenge_image: project.challenge_image || "",
          challenge_description: project.challenge_description || "",
          challenge_title_color: project.challenge_title_color || "#006666",
          challenge_text_color: project.challenge_text_color || "#16141F",
          solution_section_title: project.solution_section_title || "La Solución",
          solution_image: project.solution_image || "",
          solution_description: project.solution_description || "",
          solution_title_color: project.solution_title_color || "#006666",
          solution_text_color: project.solution_text_color || "#16141F",
          services: project.services || [],
          technologies: project.technologies || [],
          is_active: project.is_active,
          featured: project.featured,
          sort_order: project.sort_order,
        });
      } else {
        setFormData(emptyFormData);
      }
    }
  }, [isOpen, project, mode]);

  const handleInputChange = (field: keyof LandingProjectInput, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "hero_title" && mode === "create") {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }
  };

  const handleAddService = () => {
    const newService: ServiceItem = {
      title: "",
      description: "",
      icon: "ListCheck",
      color: "#E1FF00",
    };
    setFormData((prev) => ({
      ...prev,
      services: [...prev.services, newService],
    }));
  };

  const handleUpdateService = (index: number, field: keyof ServiceItem, value: string) => {
    setFormData((prev) => {
      const newServices = [...prev.services];
      newServices[index] = { ...newServices[index], [field]: value };
      return { ...prev, services: newServices };
    });
  };

  const handleRemoveService = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  };

  const handleAddTechnology = () => {
    const newTech: TechnologyItem = {
      name: "",
      icon: "Code",
      color: "#FF5B00",
    };
    setFormData((prev) => ({
      ...prev,
      technologies: [...prev.technologies, newTech],
    }));
  };

  const handleUpdateTechnology = (index: number, field: keyof TechnologyItem, value: string) => {
    setFormData((prev) => {
      const newTechs = [...prev.technologies];
      newTechs[index] = { ...newTechs[index], [field]: value };
      return { ...prev, technologies: newTechs };
    });
  };

  const handleRemoveTechnology = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index),
    }));
  };

  const isFormValid = () => {
    return !!(formData.hero_title && formData.hero_category && formData.slug);
  };

  const handleSubmit = async () => {
    if (!formData.hero_title) {
      addToast({ title: "Error", description: "El título es requerido", color: "danger" });
      return;
    }
    if (!formData.hero_category) {
      addToast({ title: "Error", description: "La categoría es requerida", color: "danger" });
      return;
    }
    if (!formData.slug) {
      addToast({ title: "Error", description: "El slug es requerido", color: "danger" });
      return;
    }

    try {
      if (mode === "create") {
        const result = await createProject(formData);
        if (result) {
          setFormData(emptyFormData);
          onSuccess?.();
          onClose();
        }
      } else {
        await updateProject(project!.id, formData);
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error(`Error al ${mode === "create" ? "crear" : "actualizar"} proyecto:`, error);
    }
  };

  const inputClasses = {
    inputWrapper: "!border-[#D4DEED] !rounded-[12px] data-[hover=true]:!border-[#265197]",
    label: "!text-[#265197]",
    input: "placeholder:text-[#A7BDE2] !text-[#265197]",
  };

  return (
    <DrawerCitricaAdmin
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "Agregar Proyecto Landing" : "Editar Proyecto Landing"}
      size="2xl"
      footer={
        <>
          <Button isAdmin variant="secondary" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            isAdmin
            variant="primary"
            className="bg-[#42668A]"
            onPress={handleSubmit}
            isLoading={isLoading}
            isDisabled={!isFormValid() || isLoading}
          >
            {mode === "create" ? "Crear Proyecto" : "Guardar Cambios"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-6 pb-2">
          <div className="flex items-center gap-2">
            <Switch
              isSelected={formData.is_active}
              onValueChange={(val) => handleInputChange("is_active", val)}
              size="sm"
            />
            <Text variant="label" color="#265197">Activo</Text>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              isSelected={formData.featured}
              onValueChange={(val) => handleInputChange("featured", val)}
              size="sm"
            />
            <Text variant="label" color="#265197">Destacado</Text>
          </div>
          <Input
            label="Orden"
            type="number"
            value={String(formData.sort_order)}
            onChange={(e) => handleInputChange("sort_order", parseInt(e.target.value) || 0)}
            variant="faded"
            classNames={inputClasses}
            className="w-24"
          />
        </div>

        <Divider className="bg-[#D4DEED]" />

        <div className="flex flex-col gap-3">
          <Section title="Hero Section" defaultOpen={true}>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Título"
                placeholder="Ej: MiOllita"
                value={formData.hero_title}
                onChange={(e) => handleInputChange("hero_title", e.target.value)}
                required
                variant="faded"
                classNames={inputClasses}
              />
              <Input
                label="Categoría"
                placeholder="Ej: Mobile App, E-Commerce, Website"
                value={formData.hero_category}
                onChange={(e) => handleInputChange("hero_category", e.target.value)}
                required
                variant="faded"
                classNames={inputClasses}
              />
              <Input
                label="Slug"
                placeholder="mi-proyecto"
                value={formData.slug}
                onChange={(e) => handleInputChange("slug", e.target.value)}
                required
                variant="faded"
                classNames={inputClasses}
                description="Se usa en la URL: /projects/slug"
              />
              <Input
                label="Texto Botón"
                placeholder="Ver Demo"
                value={formData.hero_button_label || ""}
                onChange={(e) => handleInputChange("hero_button_label", e.target.value)}
                variant="faded"
                classNames={inputClasses}
              />
              <div className="col-span-2">
                <Input
                  label="Subtítulo"
                  placeholder="Descripción corta del proyecto"
                  value={formData.hero_subtitle || ""}
                  onChange={(e) => handleInputChange("hero_subtitle", e.target.value)}
                  variant="faded"
                  classNames={inputClasses}
                />
              </div>
              <div className="col-span-2">
                <div className="flex flex-col gap-2">
                  <Text variant="label" color="#265197">Imagen Hero</Text>
                  {formData.hero_image ? (
                    <div className="relative border border-[#D4DEED] rounded-[12px] p-3 bg-[#F8FAFC]">
                      <div className="flex items-center gap-4">
                        <img
                          src={formData.hero_image}
                          alt="Hero preview"
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <Text variant="body" color="#265197" className="truncate block">
                            {formData.hero_image.split("/").pop()}
                          </Text>
                          <Text variant="label" color="#678CC5">
                            Imagen cargada
                          </Text>
                        </div>
                        <Button
                          isIconOnly
                          variant="flat"
                          size="sm"
                          onPress={handleRemoveHeroImage}
                          className="!min-w-0 !p-2"
                        >
                          <Icon name="Trash2" className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => heroImageInputRef.current?.click()}
                      className="border-2 border-dashed border-[#D4DEED] rounded-[12px] p-6 text-center cursor-pointer hover:border-[#265197] hover:bg-[#F8FAFC] transition-colors"
                    >
                      {uploadingHero ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-full max-w-xs bg-[#D4DEED] rounded-full h-2">
                            <div
                              className="bg-[#265197] h-2 rounded-full transition-all duration-300"
                              style={{ width: `${heroProgress}%` }}
                            />
                          </div>
                          <Text variant="label" color="#678CC5">
                            Subiendo... {heroProgress}%
                          </Text>
                        </div>
                      ) : (
                        <>
                          <Icon name="Upload" className="w-8 h-8 text-[#678CC5] mx-auto mb-2" />
                          <Text variant="body" color="#678CC5">
                            Click para subir imagen
                          </Text>
                          <Text variant="label" color="#A7BDE2">
                            PNG, JPG, WEBP o GIF (máx. 5MB)
                          </Text>
                        </>
                      )}
                    </div>
                  )}
                  <input
                    ref={heroImageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleHeroImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </Section>

          <Section title="Descripción del Proyecto">
            <div className="flex flex-col gap-4">
              <Input
                label="Título Principal"
                placeholder="Descripción principal del proyecto"
                value={formData.description_main_title || ""}
                onChange={(e) => handleInputChange("description_main_title", e.target.value)}
                variant="faded"
                classNames={inputClasses}
              />
              <textarea
                placeholder="Texto de descripción..."
                value={formData.description_text || ""}
                onChange={(e) => handleInputChange("description_text", e.target.value)}
                className="w-full p-3 border border-[#D4DEED] rounded-[12px] min-h-[100px] text-[#265197] placeholder:text-[#A7BDE2] focus:outline-none focus:border-[#265197]"
              />
            </div>
          </Section>

          <Section title="El Desafío">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Text variant="label" color="#265197">Imagen del Desafío</Text>
                {formData.challenge_image ? (
                  <div className="relative border border-[#D4DEED] rounded-[12px] p-3 bg-[#F8FAFC]">
                    <div className="flex items-center gap-4">
                      <img
                        src={formData.challenge_image}
                        alt="Challenge preview"
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <Text variant="body" color="#265197" className="truncate block">
                          {formData.challenge_image.split("/").pop()}
                        </Text>
                        <Text variant="label" color="#678CC5">
                          Imagen cargada
                        </Text>
                      </div>
                      <Button
                        isIconOnly
                        variant="flat"
                        size="sm"
                        onPress={handleRemoveChallengeImage}
                        className="!min-w-0 !p-2"
                      >
                        <Icon name="Trash2" className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => challengeImageInputRef.current?.click()}
                    className="border-2 border-dashed border-[#D4DEED] rounded-[12px] p-6 text-center cursor-pointer hover:border-[#265197] hover:bg-[#F8FAFC] transition-colors"
                  >
                    {uploadingChallenge ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-full max-w-xs bg-[#D4DEED] rounded-full h-2">
                          <div
                            className="bg-[#265197] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${challengeProgress}%` }}
                          />
                        </div>
                        <Text variant="label" color="#678CC5">
                          Subiendo... {challengeProgress}%
                        </Text>
                      </div>
                    ) : (
                      <>
                        <Icon name="Upload" className="w-8 h-8 text-[#678CC5] mx-auto mb-2" />
                        <Text variant="body" color="#678CC5">
                          Click para subir imagen
                        </Text>
                        <Text variant="label" color="#A7BDE2">
                          PNG, JPG, WEBP o GIF (máx. 5MB)
                        </Text>
                      </>
                    )}
                  </div>
                )}
                <input
                  ref={challengeImageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleChallengeImageUpload}
                  className="hidden"
                />
              </div>
              <textarea
                placeholder="Descripción del desafío..."
                value={formData.challenge_description || ""}
                onChange={(e) => handleInputChange("challenge_description", e.target.value)}
                className="w-full p-3 border border-[#D4DEED] rounded-[12px] min-h-[100px] text-[#265197] placeholder:text-[#A7BDE2] focus:outline-none focus:border-[#265197]"
              />
            </div>
          </Section>

          <Section title="La Solución">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Text variant="label" color="#265197">Imagen de la Solución</Text>
                {formData.solution_image ? (
                  <div className="relative border border-[#D4DEED] rounded-[12px] p-3 bg-[#F8FAFC]">
                    <div className="flex items-center gap-4">
                      <img
                        src={formData.solution_image}
                        alt="Solution preview"
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <Text variant="body" color="#265197" className="truncate block">
                          {formData.solution_image.split("/").pop()}
                        </Text>
                        <Text variant="label" color="#678CC5">
                          Imagen cargada
                        </Text>
                      </div>
                      <Button
                        isIconOnly
                        variant="flat"
                        size="sm"
                        onPress={handleRemoveSolutionImage}
                        className="!min-w-0 !p-2"
                      >
                        <Icon name="Trash2" className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => solutionImageInputRef.current?.click()}
                    className="border-2 border-dashed border-[#D4DEED] rounded-[12px] p-6 text-center cursor-pointer hover:border-[#265197] hover:bg-[#F8FAFC] transition-colors"
                  >
                    {uploadingSolution ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-full max-w-xs bg-[#D4DEED] rounded-full h-2">
                          <div
                            className="bg-[#265197] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${solutionProgress}%` }}
                          />
                        </div>
                        <Text variant="label" color="#678CC5">
                          Subiendo... {solutionProgress}%
                        </Text>
                      </div>
                    ) : (
                      <>
                        <Icon name="Upload" className="w-8 h-8 text-[#678CC5] mx-auto mb-2" />
                        <Text variant="body" color="#678CC5">
                          Click para subir imagen
                        </Text>
                        <Text variant="label" color="#A7BDE2">
                          PNG, JPG, WEBP o GIF (máx. 5MB)
                        </Text>
                      </>
                    )}
                  </div>
                )}
                <input
                  ref={solutionImageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleSolutionImageUpload}
                  className="hidden"
                />
              </div>
              <textarea
                placeholder="Descripción de la solución..."
                value={formData.solution_description || ""}
                onChange={(e) => handleInputChange("solution_description", e.target.value)}
                className="w-full p-3 border border-[#D4DEED] rounded-[12px] min-h-[100px] text-[#265197] placeholder:text-[#A7BDE2] focus:outline-none focus:border-[#265197]"
              />
            </div>
          </Section>

          <Section title="Servicios" badge={formData.services.length}>
            <div className="flex flex-col gap-4">
              {formData.services.map((service, index) => (
                <div key={index} className="border border-[#D4DEED] rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <Text variant="label" color="#678CC5">Servicio {index + 1}</Text>
                    <Button
                      isIconOnly
                      variant="flat"
                      size="sm"
                      onPress={() => handleRemoveService(index)}
                      className="!min-w-0 !p-1"
                    >
                      <Icon name="Trash2" className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Título"
                      placeholder="Nombre del servicio"
                      value={service.title}
                      onChange={(e) => handleUpdateService(index, "title", e.target.value)}
                      variant="faded"
                      classNames={inputClasses}
                    />
                    <Input
                      label="Icono"
                      placeholder="ListCheck, FolderKanban, etc."
                      value={service.icon}
                      onChange={(e) => handleUpdateService(index, "icon", e.target.value)}
                      variant="faded"
                      classNames={inputClasses}
                    />
                    <div className="col-span-2">
                      <Input
                        label="Descripción"
                        placeholder="Descripción del servicio"
                        value={service.description}
                        onChange={(e) => handleUpdateService(index, "description", e.target.value)}
                        variant="faded"
                        classNames={inputClasses}
                      />
                    </div>
                    <Input
                      label="Color"
                      placeholder="#E1FF00"
                      value={service.color}
                      onChange={(e) => handleUpdateService(index, "color", e.target.value)}
                      variant="faded"
                      classNames={inputClasses}
                    />
                  </div>
                </div>
              ))}
              <Button
                isAdmin
                variant="secondary"
                onPress={handleAddService}
                className="w-full"
              >
                <Icon name="Plus" className="w-4 h-4 mr-2" />
                Agregar Servicio
              </Button>
            </div>
          </Section>

          <Section title="Tecnologías" badge={formData.technologies.length}>
            <div className="flex flex-col gap-4">
              {formData.technologies.map((tech, index) => (
                <div key={index} className="border border-[#D4DEED] rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <Text variant="label" color="#678CC5">Tecnología {index + 1}</Text>
                    <Button
                      isIconOnly
                      variant="flat"
                      size="sm"
                      onPress={() => handleRemoveTechnology(index)}
                      className="!min-w-0 !p-1"
                    >
                      <Icon name="Trash2" className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      label="Nombre"
                      placeholder="React JS"
                      value={tech.name}
                      onChange={(e) => handleUpdateTechnology(index, "name", e.target.value)}
                      variant="faded"
                      classNames={inputClasses}
                    />
                    <Input
                      label="Icono"
                      placeholder="Code, Server, etc."
                      value={tech.icon}
                      onChange={(e) => handleUpdateTechnology(index, "icon", e.target.value)}
                      variant="faded"
                      classNames={inputClasses}
                    />
                    <Input
                      label="Color"
                      placeholder="#FF5B00"
                      value={tech.color}
                      onChange={(e) => handleUpdateTechnology(index, "color", e.target.value)}
                      variant="faded"
                      classNames={inputClasses}
                    />
                  </div>
                </div>
              ))}
              <Button
                isAdmin
                variant="secondary"
                onPress={handleAddTechnology}
                className="w-full"
              >
                <Icon name="Plus" className="w-4 h-4 mr-2" />
                Agregar Tecnología
              </Button>
            </div>
          </Section>
        </div>
      </div>
    </DrawerCitricaAdmin>
  );
}
