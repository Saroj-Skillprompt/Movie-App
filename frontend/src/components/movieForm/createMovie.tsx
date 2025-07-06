// Updated CreateMovie.tsx with improvements
import { movieSchema } from "@/lib/movieSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { InputField } from "../ui/InputField";
import { CheckboxGroupField } from "../ui/CheckboxGroupField";
import { SelectField } from "../ui/selectField";
import { DynamicInputListField } from "../ui/DynamicInputField";
import { FileUploadField } from "../ui/FileUploadField";
import { Button } from "../ui/button";
import { useCreateMovieMutation } from "@/api/movies/movie.mutations";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const genreOptions = [
  "Action",
  "Romantic",
  "Sci-Fi",
  "Drama",
  "Horror",
  "Comedy",
];
const categoryOptions = ["featured", "trending-now", "recent"];

const CreateMovie = () => {
  const mutation = useCreateMovieMutation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const methods = useForm<z.infer<typeof movieSchema>>({
    resolver: zodResolver(movieSchema),
    defaultValues: {
      genre: [],
      cast: [""],
      title: "",
      description: "",
      director: "",
      release_year: 2024,
      duration: 120,
      category: "featured",
    },
  });

  const { handleSubmit, reset } = methods;
  const onSubmit = async (data: z.infer<typeof movieSchema>) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("director", data.director);
    formData.append("release_year", data.release_year.toString());
    formData.append("duration", data.duration.toString());
    formData.append("genre", JSON.stringify(data.genre));
    formData.append("cast", JSON.stringify(data.cast));
    formData.append("category", data.category);

    if (data.poster_url[0]) {
      if (data.poster_url[0].size > 5 * 1024 * 1024) {
        toast.error("Poster must be under 5MB.");
        return;
      }
      formData.append("poster_url", data.poster_url[0]);
    }

    if (data.video_url[0]) {
      if (data.video_url[0].size > 100 * 1024 * 1024) {
        toast.error("Video must be under 100MB.");
        return;
      }
      formData.append("video_url", data.video_url[0]);
    }

    mutation.mutate(formData, {
      onSuccess: (res) => {
        toast.success(res.message || "Movie created successfully!");
        queryClient.invalidateQueries({ queryKey: ["movies"] });
        reset();
        const fileInputs =
          document.querySelectorAll<HTMLInputElement>('input[type="file"]');
        fileInputs.forEach((input) => (input.value = ""));
        navigate("/movies");
      },
      onError: (err: unknown) => {
        if (
          err &&
          typeof err === "object" &&
          "response" in err &&
          err.response &&
          typeof err.response === "object" &&
          "data" in err.response &&
          typeof err.response.data === "object"
        ) {
          const errorData = err.response.data as { message?: string };
          toast.error(errorData.message || "Failed to create movie");
          console.error("Create Movie Error:", errorData);
        } else if (err instanceof Error) {
          toast.error(err.message);
        } else {
          toast.error("Failed to create movie");
        }
      },
    });
  };

  return (
    <div className="min-h-screen pt-20 p-6 max-w-2xl mx-auto bg-white text-black dark:bg-gray-900 dark:text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Create New Movie</h1>
        <Link
          to="/dashboard"
          className="bg-pink-500 hover:bg-pink-600 text-black dark:bg-gray-700 dark:hover:bg-gray-800 dark:text-white px-4 py-2 rounded-lg transition-colors"
        >
          Back to list
        </Link>
      </div>
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 bg-pink-100  text-black dark:text-white p-8 rounded-xl shadow-xl"
        >
          <InputField
            label="Title:"
            type="text"
            name="title"
            placeholder="Enter Title"
          />
          <InputField
            label="Description:"
            type="text"
            name="description"
            placeholder="Enter description"
          />
          <CheckboxGroupField
            label="Genres:"
            name="genre"
            options={genreOptions}
          />
          <SelectField
            label="Category:"
            name="category"
            options={categoryOptions}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputField
              label="Director:"
              name="director"
              type="text"
              placeholder="Enter Director"
            />
            <InputField
              label="Release Year:"
              name="release_year"
              type="number"
              placeholder=""
            />
            <InputField
              label="Duration (minutes):"
              type="number"
              name="duration"
              placeholder=""
            />
          </div>
          <DynamicInputListField
            label="Cast Members:"
            name="cast"
            className="space-y-3"
          />
          <FileUploadField
            name="poster_url"
            label="Movie Poster:"
            accept="image/*"
          />
          <FileUploadField
            name="video_url"
            label="Movie Video:"
            accept="video/*"
          />
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {mutation.isPending ? "Creating..." : "Create Movie"}
          </Button>
        </form>
      </FormProvider>
    </div>
  );
};

export default CreateMovie;
