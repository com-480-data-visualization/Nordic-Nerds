import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export const drawClubData = (clubData, transferData, selectedPlayer, selectedClub) => {
    const textElem = document.getElementById("club-data-description");
  if (!selectedClub || !selectedPlayer){
    textElem.innerHTML = "Select a player and a club to see the player's impact on the clubs performance.";
    return;
  };

  console.log(selectedClub);
  console.log(selectedPlayer);
  const transferRecord = transferData[selectedPlayer.name];
  const transferIndices = transferRecord.data
    .map((transfer, i) => [transfer, i])
    .filter((transfer) => transfer[0].club_name == selectedClub)
    .map((transfer) => transfer[1]);
  // console.log(ranges)
//   console.log(transferRecord.data);
//   console.log(transferIndices);
  const ranges = transferIndices.map((index) => {
    const start = Number(transferRecord.data[index].season.slice(0, 4));
    const end = index == transferRecord.data.length - 1 ? transferRecord.metadata.end : Number(transferRecord.data[index + 1].season.slice(0, 4));
    return [start, end];
  });
textElem.innerHTML = `${selectedPlayer.name} ${ranges.length > 1 ? `had ${ranges.length} spells at ${selectedClub}; from ` : `played at ${selectedClub} from ${"halla"}`}`;
//   console.log(ranges);
  d3.select("#club-data-description")
    .selectAll('text')
    .data()
    .join()
    .att;
};
