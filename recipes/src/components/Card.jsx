import { useEffect, useState } from "react";
import { arrayOf, shape, number, string, bool } from "prop-types";
import CardDetails from "./CardDetails";
import { motion, AnimatePresence } from "framer-motion";

function Card({ recipe, popUp }) {
  const setPopUp = popUp;
  const [toggleCardDetails, setToggleCardDetails] = useState(false);
  const [moreDetailsRecipeId, setMoreDetailsRecipeId] = useState(0);
  const [nutrition, setNutrition] = useState({});

  const fetchData = async (recipeId) => {
    const url = `https://tasty.p.rapidapi.com/recipes/get-more-info?id=${recipeId}`;
    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": import.meta.env.VITE_RAPID_API_KEY,
        "X-RapidAPI-Host": "tasty.p.rapidapi.com",
      },
    };

    try {
      const response = await fetch(url, options);
      if (response.ok) {
        const result = await response.json();
        return result.nutrition;
      } else {
        throw new Error("Failed to fetch nutrition data");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const renderCardDetails = async () => {
      try {
        const nutritionData = await fetchData(moreDetailsRecipeId);
        setNutrition(nutritionData);
        setToggleCardDetails(!toggleCardDetails);
        setPopUp(!toggleCardDetails);
      } catch (error) {
        console.error(error);
      }
    };
    if (moreDetailsRecipeId) {
      renderCardDetails();
    }
    return () => {
    
      setNutrition({});
    };
  }, [moreDetailsRecipeId]);

  function handleParentClick(e) {
    if (e.target === e.currentTarget) {
      setToggleCardDetails(false);
      setPopUp(false);
    }
  }

  return (
    <>
      <div className="flex flex-col border-solid overflow-hidden shadow-lg m-6 w-[360px] md:w-[400px] h-[480px] bg-Pewter">
        <a
          className="hover:bg-Freesia h-full transition-all duration-500 cursor-pointer"
          onClick={() => {
            setMoreDetailsRecipeId(recipe.id);
          }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <img
              className="object-cover w-full h-80"
              src={recipe.thumbnail_url}
              alt={"dish" + recipe.id}
            />
          </motion.div>
          <div className="grow flex flex-col text-right p-8 md:p-7 lg:p-8 justify-start">
            <span className="p-2 text-xs sm:text-sm md:text-md font-bold">
              {recipe.name}
            </span>
            {recipe.user_ratings.score !== null && (
              <p className="text-xs sm:text-sm md:text-md">
                Ratings:{" "}
                {Number(recipe.user_ratings.score).toLocaleString(undefined, {
                  style: "percent",
                  minimumFractionDigits: 0,
                })}
              </p>
            )}
            {recipe.user_ratings.score === null && (
              <p className="text-xs sm:text-sm md:text-md">
                No ratings submitted
              </p>
            )}
            <p className="text-xs  sm:text-sm md:text-md text-Burnt-orange p-2">
              Go to recipe
            </p>
          </div>
        </a>
      </div>
      {/* Create a darkened background to provide focus on the popup & click outside the popup to close */}
      {toggleCardDetails && (
        <div
          className="absolute top-0 left-0 w-screen h-full outline-none bg-gray-600 opacity-50"
          onClick={handleParentClick}
        ></div>
      )}
      {/* Create the popup */}
      <AnimatePresence>
        {toggleCardDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{ duration: 0.2 }}
          >
            <CardDetails
              recipe={recipe}
              nutrition={nutrition}
              setToggleCardDetails={setToggleCardDetails}
              setPopUp={setPopUp}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

Card.propTypes = {
  popUp: bool.isRequired,
  recipe: shape({
    id: number.isRequired,
    name: string.isRequired,
    thumbnail_url: string.isRequired,
    user_ratings: shape({
      score: number,
    }),
    cook_time_minutes: number,
    num_servings: number,
    sections: arrayOf(
      shape({
        components: arrayOf(
          shape({
            raw_text: string.isRequired,
          })
        ),
      })
    ),
    instructions: arrayOf(
      shape({
        display_text: string.isRequired,
      })
    ),
    original_video_url: string,
  }),
};

export default Card;
