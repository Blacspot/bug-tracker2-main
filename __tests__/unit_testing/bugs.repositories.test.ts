import { BugRepository } from "../../src/repositories/bugs.repositories"
import * as BugServices from "../../src/services/bug.services"

jest.mock("../../src/repositories/bugs.repositories");

describe("Bugs Service Test Suite", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should return a list of bugs", async () => {
         const mockBugs = [
            { bugid: 1, title: "Task 1", description: "Desc 1", status: "Open", priority: "High", projectid: 10, reportedby: 10, assignedto: 21, createdat: "2025-10-27T10:55:33.070Z"},
            { bugid: 2, title: "Task 2", description: "Desc 2", status: "Open", priority: "Low", projectid: 17, reportedby: 19, assignedto: 27, createdat: "2024-8-27T10:45:33.070Z"},
         ];

         (BugRepository.getAllBugs as jest.Mock).mockResolvedValue(mockBugs);

         const bugs = await BugServices.getAllBugs();
         expect(bugs).toEqual(mockBugs);
         expect(BugRepository.getAllBugs).toHaveBeenCalledTimes(1);
    });

    it("should return a bug by id", async () => {
        const mockBugs = { bugid: 1, title: "Task 1", description: "Desc 1", status: "Open", priority: "High", projectid: 10, reportedby: 10, assignedto: 21, createdat: "2025-10-27T10:55:33.070Z"};
        (BugRepository.getBugById as jest.Mock).mockResolvedValue(mockBugs);
   
        const bugs = await BugServices.getBugById(1);
         expect(bugs).toEqual(mockBugs);
         expect(BugRepository.getBugById).toHaveBeenCalledTimes(1);
    });

    it("should return a bug when found by id", async () => {
        const mockBugs = { bugid: 1, title: "Task 1", description: "Desc 1", status: "Open", priority: "High", projectid: 10, reportedby: 10, assignedto: 21, createdat: "2025-10-27T10:55:33.070Z"};
        (BugRepository.getBugById as jest.Mock).mockResolvedValue(mockBugs);
   
        const bugs = await BugServices.getBugById(1);
         expect(bugs).toEqual(mockBugs);
         expect(BugRepository.getBugById).toHaveBeenCalledTimes(1);
    });
})