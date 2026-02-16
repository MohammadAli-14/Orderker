import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerApi } from "../lib/api";
import { formatDate } from "../lib/utils";
import { toast } from "react-hot-toast";

function CustomersPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: customerApi.getAll,
  });

  const { mutate: toggleVerify, isLoading: isVerifying } = useMutation({
    mutationFn: customerApi.verify,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["customers"]);
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Verification failed");
    },
  });

  const customers = data?.customers || [];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-base-content/70 mt-1">
          {customers.length} {customers.length === 1 ? "customer" : "customers"} registered
        </p>
      </div>

      {/* CUSTOMERS TABLE */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12 text-base-content/60">
              <p className="text-xl font-semibold mb-2">No customers yet</p>
              <p className="text-sm">Customers will appear here once they sign up</p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE VIEW (Hidden on Mobile) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr className="bg-base-200">
                      <th className="rounded-tl-lg">Customer</th>
                      <th>Contact Info</th>
                      <th>Status</th>
                      <th>Activity</th>
                      <th className="text-right rounded-tr-lg">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer._id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar placeholder">
                              <div className="bg-primary/10 text-primary rounded-full w-10">
                                <img
                                  src={customer.imageUrl || "https://ui-avatars.com/api/?name=" + customer.name}
                                  alt={customer.name}
                                  className="w-10 h-10 rounded-full"
                                />
                              </div>
                            </div>
                            <div>
                              <div className="font-bold text-sm">{customer.name}</div>
                              <div className="text-xs opacity-50">ID: {customer._id.slice(-6)}</div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="flex flex-col gap-1">
                            <div className="text-xs font-semibold">{customer.email}</div>
                            <div className="text-[10px] opacity-60 flex items-center gap-1">
                              <span className="bg-base-300 px-1 rounded">PH</span>
                              {customer.phoneNumber || "Not provided"}
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className={`badge badge-sm font-bold ${customer.isPhoneVerified ? 'badge-success text-white' : 'badge-warning'}`}>
                            {customer.isPhoneVerified ? 'Verified' : 'Unverified'}
                          </div>
                        </td>

                        <td>
                          <div className="flex items-center gap-2">
                            <div className="tooltip" data-tip="Addresses">
                              <span className="badge badge-ghost badge-xs">{customer.addresses?.length || 0} ADDR</span>
                            </div>
                            <div className="text-[10px] opacity-40">{formatDate(customer.createdAt)}</div>
                          </div>
                        </td>

                        <td className="text-right">
                          <button
                            className={`btn btn-xs ${customer.isPhoneVerified ? 'btn-outline btn-error' : 'btn-primary'}`}
                            disabled={isVerifying}
                            onClick={() => toggleVerify({ id: customer._id, isVerified: !customer.isPhoneVerified })}
                          >
                            {customer.isPhoneVerified ? 'Unverify' : 'Verify Now'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARD VIEW (Visible on Mobile) */}
              <div className="md:hidden space-y-4 p-4 bg-base-200/50">
                {customers.map((customer) => (
                  <div key={customer._id} className="card bg-base-100 shadow-sm border border-base-200">
                    <div className="card-body p-4">
                      {/* Header: Avatar + Name + ID */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-primary/10 text-primary rounded-full w-10 h-10">
                              <img
                                src={customer.imageUrl || "https://ui-avatars.com/api/?name=" + customer.name}
                                alt={customer.name}
                                className="w-10 h-10 rounded-full"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-base">{customer.name}</div>
                            <div className="text-xs opacity-50 font-mono">ID: {customer._id.slice(-6)}</div>
                          </div>
                        </div>
                        <div className={`badge badge-sm font-bold ${customer.isPhoneVerified ? 'badge-success text-white' : 'badge-warning'}`}>
                          {customer.isPhoneVerified ? 'Verified' : 'Unverified'}
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="bg-base-200/50 rounded-lg p-3 text-xs space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="opacity-60">Email:</span>
                          <span className="font-semibold">{customer.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-60">Phone:</span>
                          <span className="font-semibold">{customer.phoneNumber || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-60">Joined:</span>
                          <span>{formatDate(customer.createdAt)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-between items-center pt-2 border-t border-base-100">
                        <div className="badge badge-ghost badge-sm">
                          {customer.addresses?.length || 0} Addresses
                        </div>
                        <button
                          className={`btn btn-sm ${customer.isPhoneVerified ? 'btn-outline btn-error' : 'btn-primary'}`}
                          disabled={isVerifying}
                          onClick={() => toggleVerify({ id: customer._id, isVerified: !customer.isPhoneVerified })}
                        >
                          {customer.isPhoneVerified ? 'Unverify' : 'Verify Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomersPage;
