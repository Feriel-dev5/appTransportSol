const { asyncHandler } = require("../utils/asyncHandler");
const { parsePagination } = require("../utils/pagination");
const {
  createNewRequest,
  getMyRequests,
  getAllRequests,
  getRequestById,
  approveRequest,
  assignRequest,
  rejectRequest,
  updateRequestByPassenger,
  cancelRequestByPassenger,
  deleteRequest,
} = require("../Services/requests.service");

const createRequest = asyncHandler(async (req, res) => {
  const request = await createNewRequest(req.user.id, req.body);
  res.status(201).json({ request });
});

const listMyRequests = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const requests = await getMyRequests(req.user.id, pagination, req.query);
  res.json({ page: pagination.page, limit: pagination.limit, data: requests });
});

const listRequests = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const requests = await getAllRequests(pagination, req.query);
  res.json({ page: pagination.page, limit: pagination.limit, data: requests });
});

const getRequestByIdHandler = asyncHandler(async (req, res) => {
  const request = await getRequestById(req.params.id, req.user);
  res.json({ request });
});

const assignRequestHandler = asyncHandler(async (req, res) => {
  const result = await assignRequest(req.params.id, req.body, req.user.id);
  res.json(result);
});

const approveRequestHandler = asyncHandler(async (req, res) => {
  const result = await approveRequest(req.params.id, req.user.id);
  res.json(result);
});

const rejectRequestHandler = asyncHandler(async (req, res) => {
  const result = await rejectRequest(req.params.id, req.user.id);
  res.json({ request: result });
});

const updateMyRequestHandler = asyncHandler(async (req, res) => {
  const request = await updateRequestByPassenger(
    req.params.id,
    req.user.id,
    req.body,
  );
  res.json({ request });
});

const cancelMyRequestHandler = asyncHandler(async (req, res) => {
  const request = await cancelRequestByPassenger(req.params.id, req.user.id);
  res.json({ request });
});

const deleteRequestHandler = asyncHandler(async (req, res) => {
  await deleteRequest(req.params.id, req.user.id);
  res.json({ message: "Request deleted successfully" });
});

module.exports = {
  createRequest,
  listMyRequests,
  listRequests,
  getRequestByIdHandler,
  assignRequestHandler,
  approveRequestHandler,
  rejectRequestHandler,
  updateMyRequestHandler,
  cancelMyRequestHandler,
  deleteRequestHandler,
};
